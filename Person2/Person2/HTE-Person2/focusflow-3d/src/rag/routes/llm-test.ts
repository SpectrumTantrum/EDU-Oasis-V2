import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getModel, getProviderName } from '@/rag/llm';

export const maxDuration = 30;

export async function GET() {
  try {
    const { text } = await generateText({
      model: getModel(false),
      prompt: 'Reply in one short sentence: What is 2+2?',
      maxOutputTokens: 100,
      maxRetries: 2,
    });
    return NextResponse.json({ ok: true, reply: text, provider: getProviderName() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const provider = getProviderName();
    return NextResponse.json(
      { ok: false, error: `llm-test failed [provider=${provider}]: ${message}` },
      { status: 500 },
    );
  }
}
