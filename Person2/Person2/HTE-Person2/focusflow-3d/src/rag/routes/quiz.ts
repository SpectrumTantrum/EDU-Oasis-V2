import { NextRequest, NextResponse } from 'next/server';
import { generateObject, zodSchema } from 'ai';
import { z } from 'zod';
import { getModel, getProviderName } from '@/rag/llm';
import { cacheGetAsync, cacheSetAsync, cacheKey } from '@/rag/cache';
import type { QuizQuestion } from '@/rag/types';

const QuizOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correct_index: z.number().min(0).max(3),
      explanation: z.string().optional(),
    }),
  ),
});

const QuizRequestSchema = z.object({
  concept_id: z.string().trim().min(1, 'concept_id required'),
  concept_name: z.string().trim().min(1).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  count: z.coerce.number().int().min(1).max(5).default(1),
});

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const parsed = QuizRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
        { status: 400 },
      );
    }
    const conceptId = parsed.data.concept_id;
    const conceptName = parsed.data.concept_name || conceptId;
    const difficulty = parsed.data.difficulty;
    const count = parsed.data.count;

    const quizCacheKey = cacheKey('quiz', conceptId, difficulty, String(count));
    const cached = await cacheGetAsync<{ questions: QuizQuestion[] }>(quizCacheKey);
    if (cached) return NextResponse.json(cached);

    const { object } = await generateObject({
      model: getModel(false),
      schema: zodSchema(QuizOutputSchema),
      maxRetries: 2,
      prompt: `Generate ${count} multiple-choice quiz question(s) about the concept "${conceptName}" (id: ${conceptId}).
Difficulty: ${difficulty}. Easy = recall; Medium = apply; Hard = analyze/synthesize.
Output exactly ${count} question(s). Each has "question", "options" (array of 4 strings), "correct_index" (0-3), and optional "explanation".`,
    });

    const generatedQuestions = object.questions as z.infer<typeof QuizOutputSchema>['questions'];
    const questions: QuizQuestion[] = generatedQuestions.map(
      (q: z.infer<typeof QuizOutputSchema>['questions'][number]) => ({
        concept_id: conceptId,
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        difficulty,
        explanation: q.explanation,
      }),
    );

    const out = { questions };
    await cacheSetAsync(quizCacheKey, out);
    return NextResponse.json(out);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const provider = getProviderName();
    return NextResponse.json(
      { error: `quiz generation failed [provider=${provider}]: ${message}` },
      { status: 500 },
    );
  }
}
