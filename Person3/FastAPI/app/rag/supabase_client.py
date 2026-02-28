import os
from functools import lru_cache
from typing import Optional

from supabase import Client, create_client


@lru_cache(maxsize=1)
def get_supabase() -> Optional[Client]:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    try:
        return create_client(url, key)
    except Exception:
        return None

