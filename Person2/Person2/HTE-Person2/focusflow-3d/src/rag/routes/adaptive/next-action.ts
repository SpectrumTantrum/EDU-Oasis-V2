/**
 * POST /api/adaptive/next-action — getNextAction() (Person 6, PRD §5.4)
 * Decision engine combining knowledge state + cognitive state.
 * Determines: next concept, difficulty, modality, chunk size, room transformation commands.
 *
 * Body: {
 *   user_id?: string,
 *   concepts: ConceptNode[],
 *   learner_state: LearnerStateSnapshot,
 *   session_params: SessionParams,
 * }
 *
 * Returns: NextAction
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  computePrerequisiteLocks,
  decideNextAction,
  type SessionParams,
} from '@/rag/adaptive';
import type { ConceptNode, LearnerStateSnapshot } from '@/rag/types';
import { apiError, getErrorMessage } from '@/rag/api-error';

const ExplanationModeSchema = z.enum(['visual', 'analogy', 'step-by-step', 'socratic']);
const CognitiveStateSchema = z.enum(['focused', 'okay', 'drifting', 'done']);

const ConceptNodeSchema = z.object({
  concept_id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().optional(),
  mastery: z.number(),
  attempts: z.number().int(),
  last_seen: z.string().trim().min(1),
  error_patterns: z.array(z.string()),
  preferred_mode: ExplanationModeSchema,
  prerequisites: z.array(z.string()),
});

const LearnerStateSchema = z.object({
  concepts: z.record(
    z.string(),
    z.object({
      mastery: z.number(),
      last_seen: z.string().trim().min(1),
      error_patterns: z.array(z.string()),
    }),
  ),
  cognitive_state: CognitiveStateSchema,
  session_minutes: z.number().optional(),
});

const SessionParamsSchema = z.object({
  cognitive_state: CognitiveStateSchema,
  chunk_size: z.enum(['short', 'medium', 'long']),
  difficulty_bias: z.enum(['easier', 'normal', 'harder']),
  preferred_modality: ExplanationModeSchema,
  suggest_break: z.boolean(),
});

const NextActionRequestSchema = z.object({
  user_id: z.string().trim().min(1).optional(),
  concepts: z.array(ConceptNodeSchema).min(1, 'concepts array required'),
  learner_state: LearnerStateSchema,
  session_params: SessionParamsSchema,
});

export async function POST(request: NextRequest) {
  try {
    const parsed = NextActionRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('INVALID_REQUEST', parsed.error.issues[0]?.message ?? 'Invalid request body', 400, {
        details: parsed.error.flatten(),
      });
    }
    const concepts: ConceptNode[] = parsed.data.concepts;
    const learnerState: LearnerStateSnapshot = parsed.data.learner_state;
    const sessionParams: SessionParams = parsed.data.session_params;

    // Build mastery map from learner state
    const masteryMap: Record<string, number> = {};
    for (const c of concepts) {
      const stateData = learnerState.concepts[c.concept_id];
      masteryMap[c.concept_id] = stateData?.mastery ?? c.mastery;
    }

    // Compute prerequisite locks
    const locks = computePrerequisiteLocks(concepts, masteryMap);

    // Decide next action
    const action = decideNextAction(concepts, learnerState, sessionParams, locks);

    return NextResponse.json({
      ...action,
      prerequisite_locks: locks,
    });
  } catch (err) {
    return apiError('INTERNAL_ERROR', getErrorMessage(err), 500);
  }
}
