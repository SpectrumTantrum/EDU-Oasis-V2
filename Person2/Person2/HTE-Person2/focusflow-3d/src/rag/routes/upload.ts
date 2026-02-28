import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSupabaseClient } from '@/rag/supabase';

export const maxDuration = 60;
const UPLOAD_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'uploads';

function toSafeFilename(name: string): string {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
    const file = formData.get('file') as File | null;
    if (!file || typeof file.type !== 'string' || file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Please upload a PDF file (multipart/form-data, field: file)' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/${Date.now()}-${toSafeFilename(file.name)}`;

    // 1) Supabase Storage（PRD 對齊）
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error: uploadError } = await supabase.storage
        .from(UPLOAD_BUCKET)
        .upload(key, buffer, { contentType: 'application/pdf', upsert: false });
      if (!uploadError) {
        const { data: publicData } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(key);
        return NextResponse.json({
          ok: true,
          provider: 'supabase',
          bucket: UPLOAD_BUCKET,
          path: key,
          url: publicData.publicUrl,
          size: buffer.length,
          message: 'Uploaded to Supabase Storage. Use this URL or POST /api/ingest with pdfBase64 for extraction.',
        });
      }

      console.warn(`supabase upload failed: ${uploadError.message}`);
    }

    // 2) Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(key, file, {
        access: 'public',
        addRandomSuffix: true,
      });
      return NextResponse.json({
        ok: true,
        provider: 'vercel-blob',
        url: blob.url,
        size: buffer.length,
        message: 'Uploaded to Vercel Blob. Use this URL or POST /api/ingest with pdfBase64 for extraction.',
      });
    }

    // 3) S3（選用）
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET;
    if (bucket) {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const client = new S3Client({ region: process.env.AWS_REGION ?? 'us-east-1' });
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: 'application/pdf',
        }),
      );
      return NextResponse.json({
        ok: true,
        provider: 's3',
        s3_key: key,
        size: buffer.length,
        message: 'Uploaded to S3. Call /api/ingest with pdfBase64 or multipart for extraction.',
      });
    }

    // 4) 本機：回傳 base64
    const base64 = buffer.toString('base64');
    return NextResponse.json({
      ok: true,
      provider: 'inline-base64',
      size: buffer.length,
      base64,
      message: 'PDF received. Use POST /api/ingest with body { "pdfBase64": "..." } to extract concepts.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
