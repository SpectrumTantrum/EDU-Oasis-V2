/**
 * FocusFlow 3D — API 功能完整性測試
 * 使用：先 npm run dev，再 npm run test:api
 * 可設環境變數 BASE_URL；未設時會自動嘗試 3000、3001
 */
const REQUEST_TIMEOUT_MS = 15000; // 單一請求逾時（15s），失敗時可較快結束

async function detectBaseUrl() {
  const envUrl = process.env.BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  for (const port of [3000, 3001]) {
    const url = `http://localhost:${port}`;
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${url}/api/llm-test`, { signal: controller.signal });
      clearTimeout(t);
      if (res.ok || res.status === 500) return url;
    } catch (e) {
      if (e.name === 'AbortError') console.log(`  ${url} 逾時，嘗試下一 port...`);
    }
  }
  return 'http://localhost:3000';
}

const tests = [
  {
    name: 'GET /api/llm-test — LLM 連線',
    method: 'GET',
    path: '/api/llm-test',
    body: null,
    check: (res, data) => data?.ok === true && typeof data?.reply === 'string',
  },
  {
    name: 'POST /api/ingest — 文字擷取概念',
    method: 'POST',
    path: '/api/ingest',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Binary search works on sorted arrays. It divides the array in half and compares the target. Time complexity is O(log n). Prerequisites: arrays, sorting.',
    }),
    check: (res, data) => Array.isArray(data?.concepts) && data.concepts.length > 0 && data.concepts[0].concept_id,
  },
  {
    name: 'POST /api/quiz — 生成測驗題',
    method: 'POST',
    path: '/api/quiz',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      concept_id: 'binary-search',
      concept_name: 'Binary Search',
      difficulty: 'medium',
      count: 1,
    }),
    check: (res, data) => Array.isArray(data?.questions) && data.questions.length > 0 && data.questions[0].options?.length === 4,
  },
  {
    name: 'POST /api/explain — 多模態解釋',
    method: 'POST',
    path: '/api/explain',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      concept_id: 'binary-search',
      concept_name: 'Binary Search',
      mode: 'step-by-step',
    }),
    check: (res, data) => data?.concept_id === 'binary-search' && typeof data?.explanation === 'string' && data.explanation.length > 0,
  },
  {
    name: 'POST /api/tutor — 導師聊天（串流）',
    method: 'POST',
    path: '/api/tutor',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Say hello in one short sentence.' }],
    }),
    checkStream: true,
  },
  {
    name: 'POST /api/session-summary — 階段總結',
    method: 'POST',
    path: '/api/session-summary',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conceptsStudied: ['binary-search', 'recursion'],
      sessionMinutes: 25,
      cognitiveState: 'okay',
    }),
    check: (res, data) => typeof data?.summary === 'string' && data.summary.length > 0,
  },
  {
    name: 'POST /api/upload — 上傳端點',
    method: 'POST',
    path: '/api/upload',
    body: null,
    skipBody: true,
    check: (res, data) => res.status === 400 || (data?.ok === true || (data?.message && data?.size >= 0)),
  },
];

async function fetchWithTimeout(url, opts, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(t);
    return res;
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

async function runTest(BASE_URL, t) {
  const url = BASE_URL + t.path;
  const opts = { method: t.method, headers: t.headers || {} };
  if (t.body && !t.skipBody) opts.body = t.body;

  try {
    const res = await fetchWithTimeout(url, opts);
    const contentType = res.headers.get('content-type') || '';

    if (t.checkStream) {
      const ok = res.ok && (contentType.includes('text/plain') || contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson'));
      return { ok, status: res.status, message: ok ? 'Stream OK' : `content-type: ${contentType}` };
    }

    let data = null;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else if (t.checkStream !== true) {
      const text = await res.text();
      return { ok: false, status: res.status, message: `非 JSON: ${text.slice(0, 80)}`, data: text.slice(0, 80) };
    }

    const ok = t.check ? t.check(res, data) : res.ok;
    return { ok: !!ok, status: res.status, data, message: ok ? 'OK' : '檢查未通過' };
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return {
      ok: false,
      message: isTimeout ? `逾時 (${REQUEST_TIMEOUT_MS / 1000}s)` : `連線失敗: ${err.message}`,
      data: null,
    };
  }
}

async function main() {
  console.log('FocusFlow 3D — API 功能測試');
  const BASE_URL = await detectBaseUrl();
  console.log('BASE_URL:', BASE_URL);
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    if (t.skipBody && t.body === null && t.method === 'POST') {
      try {
        const res = await fetchWithTimeout(BASE_URL + t.path, { method: 'POST' }, 5000);
        const ok = res.status === 400 || res.status === 415 || res.status === 200;
        console.log(ok ? '✓' : '✗', t.name, ok ? '' : `(status ${res.status})`);
        if (ok) passed++; else failed++;
      } catch (err) {
        console.log('✗', t.name, err.name === 'AbortError' ? '逾時' : err.message);
        failed++;
      }
      continue;
    }
    const result = await runTest(BASE_URL, t);
    const ok = result.ok;
    console.log(ok ? '✓' : '✗', t.name, result.message || result.status || '');
    if (ok) passed++; else failed++;
    if (!ok) {
      if (result.data != null) console.log('  ', typeof result.data === 'string' ? result.data : JSON.stringify(result.data).slice(0, 150));
    }
  }

  console.log('');
  console.log(`結果: ${passed} 通過, ${failed} 失敗`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
