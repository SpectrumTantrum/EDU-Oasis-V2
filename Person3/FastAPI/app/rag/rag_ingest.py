"""
RAG Ingest — Person3 FastAPI
文本分塊（RecursiveCharacterTextSplitter）+ OpenAI embedding + 寫入 Supabase material_chunks
"""
from __future__ import annotations

import hashlib
import logging
import os
from typing import Any, Optional

logger = logging.getLogger(__name__)

MATERIAL_TABLE = os.environ.get("SUPABASE_MATERIAL_TABLE", "materials")
MATERIAL_CHUNK_TABLE = os.environ.get("SUPABASE_MATERIAL_CHUNK_TABLE", "material_chunks")
EMBEDDING_MODEL = os.environ.get("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")

# Chunking defaults tuned for text-embedding-3-small (8 192 token context)
DEFAULT_CHUNK_SIZE = 512   # characters — roughly 128 tokens, safe margin
DEFAULT_CHUNK_OVERLAP = 64


def _make_source_id(prefix: str, value: str) -> str:
    digest = hashlib.sha1(value.encode("utf-8")).hexdigest()[:16]
    return f"{prefix}:{digest}"


def chunk_text(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> list[str]:
    """
    Split *text* into overlapping chunks using langchain RecursiveCharacterTextSplitter.
    Falls back to a simple sliding-window splitter when langchain is not installed.
    """
    text = " ".join(text.split())  # normalise whitespace
    if not text:
        return []

    try:
        from langchain_text_splitters import RecursiveCharacterTextSplitter  # type: ignore

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        chunks = splitter.split_text(text)
        return [c.strip() for c in chunks if c.strip()]
    except ImportError:
        logger.warning(
            "langchain-text-splitters not installed; using built-in sliding-window splitter"
        )
        return _simple_chunk(text, chunk_size, chunk_overlap)


def _simple_chunk(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Fallback sliding-window chunker."""
    if len(text) <= chunk_size:
        return [text]
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        slice_text = text[start:end]
        last_period = slice_text.rfind(". ")
        if last_period > chunk_size // 2 and end != len(text):
            slice_text = slice_text[: last_period + 1]
        chunk = slice_text.strip()
        if chunk:
            chunks.append(chunk)
        if end == len(text):
            break
        start = max(0, start + chunk_size - overlap)
    return chunks


def embed_texts(values: list[str]) -> Optional[list[list[float]]]:
    """
    Call OpenAI /embeddings and return a list of 1536-dim float vectors.
    Returns None when OPENAI_API_KEY is missing or the API call fails.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set — skipping embedding")
        return None

    clean = [v.strip() for v in values if v and v.strip()]
    if not clean:
        return None

    import requests  # already in requirements.txt

    try:
        res = requests.post(
            f"{OPENAI_BASE_URL}/embeddings",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={"input": clean, "model": EMBEDDING_MODEL},
            timeout=30,
        )
        res.raise_for_status()
        data = res.json().get("data", [])
        embeddings = [item["embedding"] for item in data]
        if len(embeddings) != len(clean):
            logger.error("Embedding count mismatch: %d vs %d", len(embeddings), len(clean))
            return None
        return embeddings
    except Exception as exc:
        logger.error("embed_texts failed: %s", exc)
        return None


def ingest_text(
    *,
    client: Any,  # supabase.Client
    text: str,
    source_id: Optional[str] = None,
    title: Optional[str] = None,
    url: Optional[str] = None,
    topic: Optional[str] = None,
    source: str = "ingest",
    metadata: Optional[dict] = None,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> dict:
    """
    Main entry point: chunk → embed → upsert into Supabase.

    Returns a summary dict:
      {"source_id": str, "chunks": int, "skipped": bool, "reason": str | None}
    """
    if not text or not text.strip():
        return {"source_id": source_id, "chunks": 0, "skipped": True, "reason": "empty text"}

    if source_id is None:
        source_id = _make_source_id("rag", text[:500])

    chunks = chunk_text(text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    if not chunks:
        return {"source_id": source_id, "chunks": 0, "skipped": True, "reason": "no chunks produced"}

    embeddings = embed_texts(chunks)
    if embeddings is None:
        return {
            "source_id": source_id,
            "chunks": len(chunks),
            "skipped": True,
            "reason": "embedding failed (check OPENAI_API_KEY)",
        }

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat()
    topic_lower = topic.lower() if topic else None

    rows = [
        {
            "source_id": source_id,
            "chunk_index": idx,
            "title": title,
            "url": url,
            "topic": topic_lower,
            "source": source,
            "chunk_text": chunk,
            "metadata": {**(metadata or {}), "snippet": chunk[:240]},
            "embedding": embeddings[idx],
            "updated_at": now,
        }
        for idx, chunk in enumerate(chunks)
    ]

    client.table(MATERIAL_CHUNK_TABLE).upsert(rows, on_conflict="source_id,chunk_index").execute()

    client.table(MATERIAL_TABLE).upsert(
        {
            "id": source_id,
            "title": title,
            "url": url,
            "topic": topic_lower,
            "source_type": source,
            "snippet": chunks[0][:240] if chunks else None,
            "content_text": text[:12_000],
            "metadata": metadata or {},
            "embedding": embeddings[0],
            "updated_at": now,
        },
        on_conflict="id",
    ).execute()

    logger.info("RAG ingest complete: source_id=%s chunks=%d", source_id, len(rows))
    return {"source_id": source_id, "chunks": len(rows), "skipped": False, "reason": None}
