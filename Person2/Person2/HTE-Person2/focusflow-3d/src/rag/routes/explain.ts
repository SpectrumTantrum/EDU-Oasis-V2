import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { z } from 'zod';
import { getModel, getProviderName } from '@/rag/llm';
import type { ExplanationMode } from '@/rag/types';
import { apiError, getErrorMessage } from '@/rag/api-error';

const modeInstructions: Record<ExplanationMode, string> = {
  visual: 'Explain using a clear visual metaphor, diagram description, or spatial analogy. Describe shapes, positions, or a simple diagram in text.',
  analogy: 'Explain by analogy to something familiar (everyday object, story, or domain the student might know).',
  'step-by-step': 'Explain in numbered steps. Be concise. One idea per step.',
  socratic: 'Explain by asking guiding questions that lead the student to reason. Include 2-4 short questions with brief hints.',
};

const ExplainRequestSchema = z.object({
  concept_id: z.string().trim().min(1, 'concept_id required'),
  concept_name: z.string().trim().min(1).optional(),
  mode: z.enum(['visual', 'analogy', 'step-by-step', 'socratic']).default('step-by-step'),
  context: z.string().trim().min(1).optional(),
});

export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    const parsed = ExplainRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('INVALID_REQUEST', parsed.error.issues[0]?.message ?? 'Invalid request body', 400, {
        details: parsed.error.flatten(),
      });
    }
    const conceptId = parsed.data.concept_id;
    const conceptName = parsed.data.concept_name || conceptId;
    const mode: ExplanationMode = parsed.data.mode;
    const context = parsed.data.context;

    const instruction = modeInstructions[mode];
    const { text } = await generateText({
      model: getModel(false),
      maxRetries: 2,
      prompt: `You are an expert tutor for neurodivergent learners. Explain the concept "${conceptName}" (id: ${conceptId}) in the following way:

${instruction}

${context ? `Additional context from the learning material:\n${context}` : ''}

Provide a clear, concise explanation. Do not use overly long paragraphs.`,
      maxOutputTokens: 800,
    });

    return NextResponse.json({ concept_id: conceptId, mode, explanation: text });
  } catch (err) {
    const provider = getProviderName();
    return apiError('PROVIDER_ERROR', `explain generation failed [provider=${provider}]: ${getErrorMessage(err)}`, 500, {
      provider,
    });
  }
}
