import hashlib
import os
from typing import List, Optional

import requests
from supabase import Client

DEFAULT_MODEL = os.environ.get("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
MATERIAL_CHUNK_TABLE = os.environ.get("SUPABASE_MATERIAL_CHUNK_TABLE", "material_chunks")
MATERIAL_TABLE = os.environ.get("SUPABASE_MATERIAL_TABLE", "materials")


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 200) -> List[str]:
    if not text:
        return []
    normalized = " ".join(text.split())
    if len(normalized) <= chunk_size:
        return [normalized]

    chunks: List[str] = []
    start = 0
    length = len(normalized)
    while start < length:
        end = min(start + chunk_size, length)
        slice_text = normalized[start:end]
        last_period = slice_text.rfind(". ")
        if last_period > int(chunk_size * 0.5) and end != length:
            slice_text = slice_text[: last_period + 1]

        chunk = slice_text.strip()
        if chunk:
            chunks.append(chunk)

        if end == length:
            break
        start = max(0, start + chunk_size - overlap)
    return chunks


def embed_texts(values: List[str]) -> Optional[List[List[float]]]:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None
    clean_values = [v.strip() for v in values if v and v.strip()]
    if not clean_values:
        return None

    try:
        res = requests.post(
            f"{OPENAI_BASE_URL}/embeddings",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"input": clean_values, "model": DEFAULT_MODEL},
            timeout=30,
        )
        res.raise_for_status()
        data = res.json().get("data", [])
        embeddings = [item.get("embedding", []) for item in data]
        if len(embeddings) != len(clean_values):
            return None
        return embeddings
    except Exception:
        return None


def make_source_id(prefix: str, value: str) -> str:
    digest = hashlib.sha1(value.encode("utf-8")).hexdigest()[:16]
    return f"{prefix}:{digest}"


def upsert_material(
    client: Client,
    *,
    source_id: str,
    text: str,
    topic: Optional[str],
    title: Optional[str],
    url: Optional[str],
    source: str,
    metadata: Optional[dict] = None,
) -> int:
    chunks = chunk_text(text)
    if not chunks:
        return 0

    embeddings = embed_texts(chunks)
    if embeddings is None:
        return 0

    now = __import__("datetime").datetime.utcnow().isoformat() + "Z"
    rows = []
    for idx, chunk in enumerate(chunks):
        rows.append(
            {
                "source_id": source_id,
                "chunk_index": idx,
                "title": title,
                "url": url,
                "topic": topic.lower() if topic else None,
                "source": source,
                "chunk_text": chunk,
                "metadata": {**(metadata or {}), "snippet": chunk[:240]},
                "embedding": embeddings[idx],
                "updated_at": now,
            }
        )

    client.table(MATERIAL_CHUNK_TABLE).upsert(rows).execute()

    client.table(MATERIAL_TABLE).upsert(
        {
          "id": source_id,
          "title": title,
          "url": url,
          "topic": topic.lower() if topic else None,
          "source_type": source,
          "snippet": chunks[0][:240] if chunks else None,
          "content_text": text[:12000],
          "metadata": metadata or {},
          "embedding": embeddings[0] if embeddings else None,
          "updated_at": now,
        }
    ).execute()

    return len(rows)

