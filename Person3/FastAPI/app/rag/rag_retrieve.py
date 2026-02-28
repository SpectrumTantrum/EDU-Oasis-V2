"""
RAG Retrieve — Person3 FastAPI
查詢向量化（embed）→ Supabase match_material_chunks RPC → 回傳 Top-K chunks
"""
from __future__ import annotations

import logging
import os
from typing import Any, Optional

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = os.environ.get("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")

# Supabase RPC function name (matches supabase/schema.sql)
MATCH_CHUNKS_RPC = "match_material_chunks"


def embed_query(query: str) -> Optional[list[float]]:
    """
    Embed a single query string via OpenAI /embeddings.
    Returns a 1536-dim float list, or None on failure.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set — cannot embed query")
        return None

    query = query.strip()
    if not query:
        return None

    import requests  # already in requirements.txt

    try:
        res = requests.post(
            f"{OPENAI_BASE_URL}/embeddings",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={"input": [query], "model": EMBEDDING_MODEL},
            timeout=15,
        )
        res.raise_for_status()
        data = res.json().get("data", [])
        if not data:
            return None
        return data[0]["embedding"]
    except Exception as exc:
        logger.error("embed_query failed: %s", exc)
        return None


def search_chunks(
    *,
    client: Any,  # supabase.Client
    query: str,
    top_k: int = 5,
    match_threshold: float = 0.0,
    topic_filter: Optional[str] = None,
) -> list[dict]:
    """
    Embed *query* and call the Supabase ``match_material_chunks`` RPC.

    Returns a list of chunk dicts (empty list on any error):
    {
      "id", "source_id", "chunk_index", "title", "url",
      "topic", "chunk_text", "source", "metadata", "similarity"
    }
    """
    query_embedding = embed_query(query)
    if query_embedding is None:
        return []

    try:
        params: dict = {
            "query_embedding": query_embedding,
            "match_count": top_k,
            "match_threshold": match_threshold,
        }
        if topic_filter:
            params["topic_filter"] = topic_filter.lower()

        response = client.rpc(MATCH_CHUNKS_RPC, params).execute()
        rows = response.data or []
        logger.info(
            "RAG retrieve: query=%r top_k=%d returned=%d", query[:60], top_k, len(rows)
        )
        return rows
    except Exception as exc:
        logger.error("search_chunks RPC failed: %s", exc)
        return []


def format_chunks_as_resources(chunks: list[dict], default_topic: str = "") -> list[dict]:
    """
    Convert raw Supabase chunk rows into the resource format expected by Person 2's
    /api/search endpoint so results are compatible across both paths.
    """
    resources = []
    for row in chunks:
        snippet = str(row.get("chunk_text") or "")[:320]
        title = row.get("title") or ""
        url = row.get("url") or ""

        if not (title or url or snippet):
            continue

        resources.append(
            {
                "title": title if title else (url or "Resource"),
                "url": url,
                "snippet": snippet,
                "score": float(row.get("similarity") or 0.0),
                "content_type": "article",
                "source": str(row.get("source") or "supabase"),
                "topic": str(row.get("topic") or default_topic),
                "chunk_index": row.get("chunk_index"),
                "source_id": row.get("source_id"),
            }
        )
    return resources
