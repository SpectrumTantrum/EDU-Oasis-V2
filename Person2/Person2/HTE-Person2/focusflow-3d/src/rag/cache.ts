/**
 * 簡單 in-memory 預緩存，供 demo 使用（Person 2, 16-18h）
 * 可鍵值：ingest:<hash>, quiz:<concept>:<difficulty>, explain:<concept>:<mode>, session-summary:<hash>
 */
import { getSupabaseClient } from './supabase';

const store = new Map<string, { data: unknown; expires: number }>();
const TTL_MS = 1000 * 60 * 60; // 1 hour
const CACHE_TABLE = process.env.SUPABASE_CACHE_TABLE ?? 'api_cache';

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry || Date.now() > entry.expires) {
    if (entry) store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function cacheSet(key: string, data: unknown, ttlMs = TTL_MS): void {
  store.set(key, { data, expires: Date.now() + ttlMs });
}

export function cacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

export async function cacheGetAsync<T>(key: string): Promise<T | null> {
  const mem = cacheGet<T>(key);
  if (mem) return mem;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(CACHE_TABLE)
    .select('value, expires_at')
    .eq('key', key)
    .maybeSingle();

  if (error || !data) return null;

  const expiresAt = Date.parse(String(data.expires_at));
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    await supabase.from(CACHE_TABLE).delete().eq('key', key);
    return null;
  }

  const value = data.value as T;
  cacheSet(key, value, Math.max(0, expiresAt - Date.now()));
  return value;
}

export async function cacheSetAsync(key: string, data: unknown, ttlMs = TTL_MS): Promise<void> {
  cacheSet(key, data, ttlMs);

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  await supabase.from(CACHE_TABLE).upsert(
    {
      key,
      value: data,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );
}
