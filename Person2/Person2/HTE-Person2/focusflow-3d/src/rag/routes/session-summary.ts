import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { z } from 'zod';
import { getModel, getProviderName } from '@/rag/llm';

export const maxDuration = 45;

const SessionSummaryRequestSchema = z.object({
  conceptsStudied: z.array(z.string().trim().min(1)).default([]),
  sessionMinutes: z.number().int().min(1).max(600).optional(),
  cognitiveState: z.string().trim().min(1).max(100).optional(),
  highlights: z.array(z.string().trim().min(1)).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = SessionSummaryRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
        { status: 400 },
      );
    }

    const { conceptsStudied, sessionMinutes, cognitiveState, highlights } = parsed.data;

    const { text } = await generateText({
      model: getModel(false),
      maxRetries: 2,
      prompt: `Generate a short, encouraging session summary for a neurodivergent learner.

Concepts studied this session: ${conceptsStudied.join(', ') || 'None specified'}
${sessionMinutes != null ? `Session length: about ${sessionMinutes} minutes.` : ''}
${cognitiveState ? `End state: ${cognitiveState}.` : ''}
${highlights.length ? `Highlights: ${highlights.join('; ')}` : ''}

Output 2-4 bullet points: what was covered, one strength, and a concrete suggestion for the next session (e.g. "Review X tomorrow" or "Try the quiz on Y"). Keep it brief and positive. Use simple language.`,
      maxOutputTokens: 400,
    });

    return NextResponse.json({
      summary: text,
      format: 'bullets',
      conceptsStudied,
      sessionMinutes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const provider = getProviderName();
    return NextResponse.json(
      { error: `session summary generation failed [provider=${provider}]: ${message}` },
      { status: 500 },
    );
  }
}
