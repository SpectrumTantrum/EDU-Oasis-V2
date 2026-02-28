import { embedTexts } from "./embeddings";
import { getErrorMessage } from "./api-error";
import { chunkText } from "./text-chunk";
import { getSupabaseClient, hasSupabaseConfig } from "./supabase";

const MATERIAL_TABLE = process.env.SUPABASE_MATERIAL_TABLE ?? "materials";
const MATERIAL_CHUNK_TABLE = process.env.SUPABASE_MATERIAL_CHUNK_TABLE ?? "material_chunks";

export interface MaterialUpsertInput {
  sourceId: string;
  text: string;
  topic?: string;
  title?: string;
  url?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface MaterialIngestResult {
  inserted: number;
  table: string;
  skipped: boolean;
}

export async function ingestMaterialIntoSupabase(input: MaterialUpsertInput): Promise<MaterialIngestResult> {
  if (!hasSupabaseConfig()) {
    return { inserted: 0, table: MATERIAL_CHUNK_TABLE, skipped: true };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { inserted: 0, table: MATERIAL_CHUNK_TABLE, skipped: true };
  }

  const chunks = chunkText(input.text);
  if (chunks.length === 0) {
    return { inserted: 0, table: MATERIAL_CHUNK_TABLE, skipped: true };
  }

  try {
    const embeddings = await embedTexts(chunks);
    const now = new Date().toISOString();
    const rows = chunks.map((chunk, idx) => ({
      source_id: input.sourceId,
      chunk_index: idx,
      title: input.title ?? null,
      url: input.url ?? null,
      topic: input.topic?.toLowerCase() ?? null,
      source: input.source ?? "ingest",
      chunk_text: chunk,
      metadata: { ...(input.metadata ?? {}), snippet: chunk.slice(0, 240) },
      embedding: embeddings[idx],
      updated_at: now,
    }));

    const { error: chunkError } = await supabase
      .from(MATERIAL_CHUNK_TABLE)
      .upsert(rows, { onConflict: "source_id,chunk_index" });

    if (chunkError) {
      throw new Error(chunkError.message);
    }

    const firstEmbedding = embeddings[0] ?? null;
    await supabase.from(MATERIAL_TABLE).upsert(
      {
        id: input.sourceId,
        title: input.title ?? null,
        url: input.url ?? null,
        topic: input.topic?.toLowerCase() ?? null,
        source_type: input.source ?? "ingest",
        snippet: chunks[0]?.slice(0, 240) ?? null,
        content_text: input.text.slice(0, 12000),
        metadata: input.metadata ?? {},
        embedding: firstEmbedding,
        updated_at: now,
      },
      { onConflict: "id" }
    );

    return { inserted: rows.length, table: MATERIAL_CHUNK_TABLE, skipped: false };
  } catch (err) {
    throw new Error(`Supabase 向量 upsert 失敗：${getErrorMessage(err)}`);
  }
}

