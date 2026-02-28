/**
 * POST /api/adaptive/knowledge-state — updateKnowledgeState() (Person 6, PRD §5.4)
 * Receives interaction events (quiz answers, explanation reads, challenges).
 * Updates mastery scores, error patterns, and modality preferences.
 *
 * Body: {
 *   user_id?: string,
 *   events: InteractionEvent[]
 * }
 *
 * Returns: { updates: MasteryDelta[], learner_state: LearnerStateSnapshot }
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  computeMasteryUpdate,
  type InteractionEvent,
  type MasteryDelta,
} from '@/rag/adaptive';
import type { LearnerStateSnapshot, ExplanationMode } from '@/rag/types';
import { getSupabaseClient } from '@/rag/supabase';
import { apiError, getErrorMessage } from '@/rag/api-error';

const LEARNER_CONCEPTS_TABLE = process.env.SUPABASE_LEARNER_CONCEPTS_TABLE ?? 'learner_concepts';
const LEARNER_PROFILE_TABLE = process.env.SUPABASE_LEARNER_PROFILE_TABLE ?? 'learner_profiles';

type PersistenceMode = 'memory' | 'supabase';

type MemoryLearnerState = LearnerStateSnapshot & {
  preferred_modes: Record<string, ExplanationMode>;
};

const learnerStates = new Map<string, MemoryLearnerState>();

const InteractionEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('quiz_correct'),
    concept_id: z.string().trim().min(1),
    difficulty: z.enum(['easy', 'medium', 'hard']),
  }),
  z.object({
    type: z.literal('quiz_incorrect'),
    concept_id: z.string().trim().min(1),
    error_pattern: z.string().trim().min(1).optional(),
  }),
  z.object({
    type: z.literal('explanation_read'),
    concept_id: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal('explain_differently'),
    concept_id: z.string().trim().min(1),
    new_mode: z.enum(['visual', 'analogy', 'step-by-step', 'socratic']),
  }),
  z.object({
    type: z.literal('challenge_complete'),
    concept_id: z.string().trim().min(1),
    difficulty: z.enum(['easy', 'medium', 'hard']),
  }),
]);

const KnowledgeStateRequestSchema = z.object({
  user_id: z.string().trim().min(1).optional(),
  events: z.array(InteractionEventSchema).min(1, 'events array required'),
});

function getOrCreateMemoryState(userId: string): MemoryLearnerState {
  if (!learnerStates.has(userId)) {
    learnerStates.set(userId, {
      concepts: {},
      cognitive_state: 'okay',
      session_minutes: 0,
      preferred_modes: {},
    });
  }
  return learnerStates.get(userId)!;
}

async function loadStateFromSupabase(userId: string): Promise<MemoryLearnerState | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const conceptQuery = await supabase
    .from(LEARNER_CONCEPTS_TABLE)
    .select('concept_id, mastery, last_seen, error_patterns, preferred_mode')
    .eq('user_id', userId);
  if (conceptQuery.error) {
    throw new Error(conceptQuery.error.message);
  }

  const concepts: MemoryLearnerState['concepts'] = {};
  const preferredModes: Record<string, ExplanationMode> = {};
  for (const row of conceptQuery.data ?? []) {
    const conceptId = row.concept_id as string;
    concepts[conceptId] = {
      mastery: Number(row.mastery ?? 0),
      last_seen: String(row.last_seen ?? new Date().toISOString()),
      error_patterns: Array.isArray(row.error_patterns)
        ? row.error_patterns.map((p) => String(p))
        : [],
    };
    if (typeof row.preferred_mode === 'string') {
      preferredModes[conceptId] = row.preferred_mode as ExplanationMode;
    }
  }

  let cognitiveState: MemoryLearnerState['cognitive_state'] = 'okay';
  let sessionMinutes = 0;
  const profileQuery = await supabase
    .from(LEARNER_PROFILE_TABLE)
    .select('cognitive_state, session_minutes')
    .eq('user_id', userId)
    .maybeSingle();
  if (!profileQuery.error && profileQuery.data) {
    const state = profileQuery.data.cognitive_state;
    if (state === 'focused' || state === 'okay' || state === 'drifting' || state === 'done') {
      cognitiveState = state;
    }
    const minutes = Number(profileQuery.data.session_minutes ?? 0);
    sessionMinutes = Number.isFinite(minutes) ? minutes : 0;
  }

  return {
    concepts,
    cognitive_state: cognitiveState,
    session_minutes: sessionMinutes,
    preferred_modes: preferredModes,
  };
}

async function persistStateToSupabase(userId: string, state: MemoryLearnerState): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const rows = Object.entries(state.concepts).map(([conceptId, conceptState]) => ({
    user_id: userId,
    concept_id: conceptId,
    mastery: conceptState.mastery,
    last_seen: conceptState.last_seen,
    error_patterns: conceptState.error_patterns,
    preferred_mode: state.preferred_modes[conceptId] ?? 'step-by-step',
    updated_at: new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const upsertConcepts = await supabase
      .from(LEARNER_CONCEPTS_TABLE)
      .upsert(rows, { onConflict: 'user_id,concept_id' });
    if (upsertConcepts.error) {
      throw new Error(upsertConcepts.error.message);
    }
  }

  const upsertProfile = await supabase.from(LEARNER_PROFILE_TABLE).upsert(
    {
      user_id: userId,
      cognitive_state: state.cognitive_state,
      session_minutes: state.session_minutes ?? 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (upsertProfile.error) {
    throw new Error(upsertProfile.error.message);
  }
}

async function loadState(userId: string): Promise<{ state: MemoryLearnerState; persistence: PersistenceMode }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { state: getOrCreateMemoryState(userId), persistence: 'memory' };
  }

  try {
    const supabaseState = await loadStateFromSupabase(userId);
    if (supabaseState) {
      learnerStates.set(userId, supabaseState);
      return { state: supabaseState, persistence: 'supabase' };
    }
  } catch (error) {
    console.warn(
      error instanceof Error
        ? `knowledge-state supabase read failed: ${error.message}`
        : 'knowledge-state supabase read failed',
    );
  }

  return { state: getOrCreateMemoryState(userId), persistence: 'memory' };
}

export async function POST(request: NextRequest) {
  try {
    const parsed = KnowledgeStateRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('INVALID_REQUEST', parsed.error.issues[0]?.message ?? 'Invalid request body', 400, {
        details: parsed.error.flatten(),
      });
    }

    const userId = parsed.data.user_id ?? 'demo-user';
    const events = parsed.data.events as InteractionEvent[];
    const loaded = await loadState(userId);
    const state = loaded.state;
    const updates: MasteryDelta[] = [];
    const now = new Date().toISOString();

    for (const event of events) {
      const conceptState = state.concepts[event.concept_id] ?? {
        mastery: 0,
        last_seen: now,
        error_patterns: [],
      };

      const delta = computeMasteryUpdate(event, conceptState.mastery);
      updates.push(delta);

      // Apply update
      conceptState.mastery = delta.new_mastery;
      conceptState.last_seen = now;
      if (event.type === 'explain_differently') {
        state.preferred_modes[event.concept_id] = event.new_mode;
      }

      if (delta.error_pattern_added) {
        const patterns = conceptState.error_patterns ?? [];
        if (!patterns.includes(delta.error_pattern_added)) {
          patterns.push(delta.error_pattern_added);
        }
        conceptState.error_patterns = patterns;
      }

      state.concepts[event.concept_id] = conceptState;
    }

    // Update modality preference if any explain_differently events
    const modeEvents = events.filter(
      (e): e is Extract<InteractionEvent, { type: 'explain_differently' }> =>
        e.type === 'explain_differently',
    );
    if (modeEvents.length > 0) {
      // Track modality preference in response (would store per-concept in Supabase)
      const lastMode = modeEvents[modeEvents.length - 1].new_mode;
      const lastUpdate = updates[updates.length - 1];
      if (lastUpdate) {
        lastUpdate.preferred_mode_update = lastMode as ExplanationMode;
      }
    }

    learnerStates.set(userId, state);
    let persistence: PersistenceMode = loaded.persistence;
    if (getSupabaseClient()) {
      try {
        await persistStateToSupabase(userId, state);
        persistence = 'supabase';
      } catch (error) {
        persistence = 'memory';
        console.warn(
          error instanceof Error
            ? `knowledge-state supabase write failed: ${error.message}`
            : 'knowledge-state supabase write failed',
        );
      }
    }

    return NextResponse.json({
      updates,
      learner_state: {
        concepts: state.concepts,
        cognitive_state: state.cognitive_state,
        session_minutes: state.session_minutes ?? 0,
      },
      persistence,
    });
  } catch (err) {
    return apiError('INTERNAL_ERROR', getErrorMessage(err), 500);
  }
}

// GET — retrieve current learner state
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('user_id') ?? 'demo-user';
    const { state, persistence } = await loadState(userId);
    return NextResponse.json({
      user_id: userId,
      learner_state: {
        concepts: state.concepts,
        cognitive_state: state.cognitive_state,
        session_minutes: state.session_minutes ?? 0,
      },
      persistence,
    });
  } catch (err) {
    return apiError('INTERNAL_ERROR', getErrorMessage(err), 500);
  }
}
