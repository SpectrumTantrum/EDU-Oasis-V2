import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { z } from 'zod';
import { getModel, getProviderName } from '@/rag/llm';
import type { LearnerStateSnapshot } from '@/rag/types';

export const maxDuration = 60;

const TutorMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().trim().min(1),
});

const LearnerStateSchema = z.object({
  concepts: z.record(
    z.string(),
    z.object({
      mastery: z.number(),
      last_seen: z.string(),
      error_patterns: z.array(z.string()),
    }),
  ),
  cognitive_state: z.enum(['focused', 'okay', 'drifting', 'done']),
  session_minutes: z.number().optional(),
});

const TutorRequestSchema = z.object({
  messages: z.array(TutorMessageSchema).min(1, 'messages array required'),
  learnerState: LearnerStateSchema.optional(),
});

const systemPromptFromState = (state?: LearnerStateSnapshot | null): string => {
  if (!state) {
    return `You are a supportive AI tutor in FocusFlow 3D, an immersive learning environment for neurodivergent students. Be concise, kind, and adaptive. Suggest activities (whiteboard concept, quiz, lab challenge, bookshelf) when relevant.`;
  }
  const weak = state.concepts
    ? Object.entries(state.concepts)
        .filter(([, v]) => v.mastery < 70)
        .map(([id]) => id)
        .slice(0, 5)
    : [];
  const cognitive = state.cognitive_state ?? 'okay';
  let prompt = `You are the AI tutor in FocusFlow 3D for neurodivergent learners. Be concise and adaptive.
Current cognitive state: ${cognitive}.`;
  if (cognitive === 'focused') prompt += ' Student is focused — suggest deeper content, fewer interruptions.';
  if (cognitive === 'drifting') prompt += ' Student may be drifting — suggest a change of activity (e.g. lab bench, short quiz).';
  if (weak.length) prompt += ` Weak or unmastered concepts to prioritize when relevant: ${weak.join(', ')}.`;
  return prompt;
};

export async function POST(request: NextRequest) {
  try {
    const parsed = TutorRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
        { status: 400 },
      );
    }
    const messages = parsed.data.messages;
    const learnerState = parsed.data.learnerState as LearnerStateSnapshot | undefined;

    const system = systemPromptFromState(learnerState);
    const history = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));

    const result = streamText({
      model: getModel(true),
      system,
      messages: history,
      maxOutputTokens: 1024,
      maxRetries: 2,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const provider = getProviderName();
    return NextResponse.json(
      { error: `tutor streaming failed [provider=${provider}]: ${message}` },
      { status: 500 },
    );
  }
}
