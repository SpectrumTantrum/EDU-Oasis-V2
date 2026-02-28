import { getErrorMessage } from "./api-error";

const DEFAULT_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY 未設定，無法產生向量嵌入");
  }
  return key;
}

export async function embedTexts(inputs: string[]): Promise<number[][]> {
  const trimmed = inputs.map((v) => v.trim()).filter(Boolean);
  if (trimmed.length === 0) return [];

  const apiKey = getOpenAIKey();
  try {
    const res = await fetch(`${OPENAI_BASE_URL}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: trimmed,
        model: DEFAULT_MODEL,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI embeddings API failed: ${res.status} ${body}`);
    }

    const json = await res.json();
    const vectors = Array.isArray(json.data)
      ? json.data.map((item: { embedding: number[] }) => item.embedding)
      : [];

    if (vectors.length !== trimmed.length) {
      throw new Error("Embedding 長度與輸入不符");
    }

    return vectors;
  } catch (err) {
    throw new Error(`embedding 失敗：${getErrorMessage(err)}`);
  }
}

export async function embedText(input: string): Promise<number[] | null> {
  const vectors = await embedTexts([input]);
  return vectors[0] ?? null;
}

