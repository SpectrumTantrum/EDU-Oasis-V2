/**
 * POST /api/adaptive/cognitive-state — assessCognitive() (Person 6, PRD §5.2)
 * Body: { explicit_checkin?: 'focused'|'okay'|'drifting'|'done', signals?: BehavioralSignals, current_modality?: ExplanationMode }
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { assessCognitive, type BehavioralSignals } from '@/rag/adaptive';
import type { ExplanationMode } from '@/rag/types';
import { apiError, getErrorMessage } from '@/rag/api-error';

const CognitiveStateSchema = z.enum(['focused', 'okay', 'drifting', 'done']);

const CognitiveStateRequestSchema = z.object({
  explicit_checkin: CognitiveStateSchema.nullable().optional(),
  signals: z
    .object({
      avg_time_on_chunk_ms: z.number().optional(),
      current_chunk_time_ms: z.number().optional(),
      explain_differently_count: z.number().optional(),
      recent_quiz_speed_ms: z.number().optional(),
      recent_quiz_correct: z.boolean().optional(),
    })
    .optional(),
  current_modality: z.enum(['visual', 'analogy', 'step-by-step', 'socratic']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = CognitiveStateRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('INVALID_REQUEST', parsed.error.issues[0]?.message ?? 'Invalid request body', 400, {
        details: parsed.error.flatten(),
      });
    }

    const explicit = parsed.data.explicit_checkin ?? null;
    const signals = (parsed.data.signals ?? {}) as BehavioralSignals;
    const currentModality = (parsed.data.current_modality as ExplanationMode | undefined) ?? 'step-by-step';

    const sessionParams = assessCognitive(explicit, signals, currentModality);

    return NextResponse.json({ session_params: sessionParams });
  } catch (err) {
    return apiError('INTERNAL_ERROR', getErrorMessage(err), 500);
  }
}
