/**
 * Content ingestion: PDF/text → LLM concept extraction → knowledge graph (Person 2, 2-8h)
 */
import { generateObject, zodSchema } from 'ai';
import { z } from 'zod';
import { getModel, getProviderName } from './llm';
import type { KnowledgeGraph, ConceptNode } from './types';

const ConceptSchema = z.object({
  concept_id: z.string().describe('kebab-case id e.g. binary-search'),
  name: z.string(),
  description: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
});

const KnowledgeGraphSchema = z.object({
  concepts: z.array(ConceptSchema),
  edges: z.array(z.object({ from: z.string(), to: z.string() })).default([]),
});

export async function extractKnowledgeGraphFromText(text: string): Promise<KnowledgeGraph> {
  try {
    const { object } = await generateObject({
      model: getModel(false),
      schema: zodSchema(KnowledgeGraphSchema),
      maxRetries: 2,
      prompt: `You are an expert educator. From the following lecture/study material text, extract a list of key concepts and their prerequisite relationships.

Rules:
- concept_id: use kebab-case (e.g. binary-search, recursion-base-case).
- List 5-15 concepts. Include prerequisites: if concept A must be understood before B, add A in B's prerequisites and add edge { from: "a", to: "b" }.
- Keep names concise.

Material:
---
${text.slice(0, 12000)}
---

Output valid JSON with "concepts" and "edges" only.`,
    });

    const now = new Date().toISOString();
    const concepts: ConceptNode[] = (object.concepts as z.infer<typeof ConceptSchema>[]).map(
      (c) => ({
        ...c,
        mastery: 0,
        attempts: 0,
        last_seen: now,
        error_patterns: [],
        preferred_mode: 'step-by-step' as const,
        prerequisites: c.prerequisites ?? [],
      })
    );

    return {
      concepts,
      edges: object.edges ?? [],
      extracted_at: now,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`ingest knowledge extraction failed [provider=${getProviderName()}]: ${message}`);
  }
}
