import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractKnowledgeGraphFromText } from '@/rag/ingest';
import { cacheGetAsync, cacheSetAsync, cacheKey } from '@/rag/cache';
import { getProviderName } from '@/rag/llm';
import { getSupabaseClient } from '@/rag/supabase';
import { ingestMaterialIntoSupabase } from '@/rag/materials';

export const maxDuration = 120;
const INGEST_TABLE = process.env.SUPABASE_INGEST_TABLE ?? 'ingested_knowledge_graphs';

const IngestJsonBodySchema = z
  .object({
    text: z.string().trim().min(50).optional(),
    pdfBase64: z.string().trim().min(1).optional(),
    storage_path: z.string().trim().min(1).optional(),
    storage_bucket: z.string().trim().min(1).optional(),
    topic: z.string().trim().min(1).max(120).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.text && !value.pdfBase64 && !value.storage_path) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide "text", "pdfBase64", or "storage_path" in JSON body',
      });
    }
  });

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text ?? '';
  } finally {
    await parser.destroy();
  }
}

async function persistIngestResult(input: {
  ingestKey: string;
  topic?: string;
  textLength: number;
  graph: Awaited<ReturnType<typeof extractKnowledgeGraphFromText>>;
}): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from(INGEST_TABLE).upsert(
    {
      ingest_key: input.ingestKey,
      topic: input.topic ?? null,
      text_length: input.textLength,
      concept_count: input.graph.concepts.length,
      edge_count: input.graph.edges.length,
      graph: input.graph,
      extracted_at: input.graph.extracted_at,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'ingest_key' },
  );

  if (error) {
    throw new Error(`supabase ingest persistence failed: ${error.message}`);
  }
}

async function extractTextFromStorage(storagePath: string, storageBucket?: string): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured for storage_path ingest');
  }

  const bucket = storageBucket ?? process.env.SUPABASE_STORAGE_BUCKET ?? 'uploads';
  const download = await supabase.storage.from(bucket).download(storagePath);
  if (download.error) {
    throw new Error(`supabase storage download failed: ${download.error.message}`);
  }
  const buffer = Buffer.from(await download.data.arrayBuffer());
  return extractTextFromPdf(buffer);
}

export async function POST(request: NextRequest) {
  try {
    let text = '';
    let topic: string | undefined;

    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const body = IngestJsonBodySchema.safeParse(await request.json());
      if (!body.success) {
        return NextResponse.json(
          { error: body.error.issues[0]?.message ?? 'Invalid request body' },
          { status: 400 },
        );
      }

      topic = body.data.topic;
      if (body.data.text) {
        text = body.data.text;
      } else if (body.data.pdfBase64) {
        const buffer = Buffer.from(body.data.pdfBase64, 'base64');
        text = await extractTextFromPdf(buffer);
      } else if (body.data.storage_path) {
        text = await extractTextFromStorage(body.data.storage_path, body.data.storage_bucket);
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const topicValue = formData.get('topic');
      topic = typeof topicValue === 'string' ? topicValue.trim() || undefined : undefined;
      if (!file || file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Upload a PDF file' }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      text = await extractTextFromPdf(buffer);
    } else {
      return NextResponse.json(
        { error: 'Use application/json with "text" or "pdfBase64", or multipart/form-data with PDF' },
        { status: 400 },
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Extracted text too short. Upload a valid PDF or provide longer text.' },
        { status: 400 },
      );
    }

    const crypto = await import('crypto');
    const ingestKey = cacheKey('ingest', crypto.createHash('sha256').update(text).digest('hex').slice(0, 16));
    const cached = await cacheGetAsync<Awaited<ReturnType<typeof extractKnowledgeGraphFromText>>>(ingestKey);
    if (cached) return NextResponse.json(cached);

    const graph = await extractKnowledgeGraphFromText(text);
    await cacheSetAsync(ingestKey, graph);

    // Fire-and-forget: direct Supabase vector ingest (does not block the response)
    ingestMaterialIntoSupabase({
      sourceId: ingestKey,
      text,
      topic,
      title: topic ?? 'uploaded-material',
      source: 'ingest',
    }).catch((err: unknown) =>
      console.warn('supabase vector ingest failed:', err instanceof Error ? err.message : err),
    );

    // Fire-and-forget: also delegate to P3 FastAPI /rag/ingest when available
    // P3 handles large texts without the Next.js serverless timeout constraint
    const p3Url = process.env.P3_SCRAPER_URL;
    if (p3Url) {
      fetch(`${p3Url}/rag/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source_id: ingestKey,
          title: topic ?? 'uploaded-material',
          topic: topic ?? null,
          source: 'ingest',
        }),
        signal: AbortSignal.timeout(5_000),
      }).catch(() => {
        // P3 may not be running locally — silently ignore
      });
    }

    // Fire-and-forget: persist knowledge graph to Supabase
    persistIngestResult({
      ingestKey,
      topic,
      textLength: text.length,
      graph,
    }).catch((err: unknown) =>
      console.warn('supabase ingest persistence failed:', err instanceof Error ? err.message : err),
    );

    return NextResponse.json(graph);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `ingest failed [provider=${getProviderName()}]: ${message}` },
      { status: 500 },
    );
  }
}
