import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function getSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function hasSupabaseConfig(): boolean {
  return Boolean(getSupabaseEnv());
}

export function getSupabaseClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;
  if (client) return client;

  client = createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
