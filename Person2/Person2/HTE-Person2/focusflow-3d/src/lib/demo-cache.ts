/**
 * Demo fallback：從 public/demo-cache/*.json 讀取預緩存回應（新需求 18-20h, 20-24h）
 * 當 API 失敗或請求帶 x-demo-fallback: 1 或 ?demo=1 時可回傳靜態 JSON
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'public', 'demo-cache');

function isDemoFallbackRequest(headers: Headers, url: string): boolean {
  if (headers.get('x-demo-fallback') === '1') return true;
  try {
    const u = new URL(url);
    return u.searchParams.get('demo') === '1';
  } catch {
    return false;
  }
}

export function wantDemoFallback(headers: Headers, url: string): boolean {
  return process.env.DEMO_FALLBACK === '1' || isDemoFallbackRequest(headers, url);
}

export function readDemoCache<T>(filename: string): T | null {
  const filePath = path.join(CACHE_DIR, filename);
  if (!existsSync(filePath)) return null;
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const DEMO_FILES = {
  ingest: 'ingest.json',
  quiz: 'quiz-binary-search-medium.json',
  explain: 'explain-binary-search-step-by-step.json',
  session_summary: 'session-summary.json',
} as const;
