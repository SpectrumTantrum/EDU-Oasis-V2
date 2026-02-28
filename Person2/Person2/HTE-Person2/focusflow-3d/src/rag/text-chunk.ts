const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_OVERLAP = 200;

export function chunkText(text: string, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP): string[] {
  if (!text) return [];

  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= chunkSize) return [normalized];

  const chunks: string[] = [];
  let start = 0;
  const len = normalized.length;

  while (start < len) {
    const end = Math.min(start + chunkSize, len);
    let slice = normalized.slice(start, end);

    // Try to break at sentence boundary
    const lastPeriod = slice.lastIndexOf(". ");
    if (lastPeriod > chunkSize * 0.5 && end !== len) {
      slice = slice.slice(0, lastPeriod + 1);
    }

    chunks.push(slice.trim());
    if (end === len) break;
    start = Math.max(0, start + chunkSize - overlap);
  }

  return chunks.filter(Boolean);
}

