/**
 * 預緩存 Demo 用 API 回應為靜態 JSON（新需求 16-18h）
 * 使用：先 npm run dev，再 npm run precache
 * 會呼叫各 API 並將結果寫入 public/demo-cache/*.json，供 fallback 使用
 */
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.join(process.cwd(), 'public', 'demo-cache');

const DEMO_TEXT =
  'Binary search works on sorted arrays. It divides the array in half and compares the target. Time complexity is O(log n). Prerequisites: arrays, sorting.';

const QUIZ_FALLBACK = {
  questions: [
    {
      concept_id: 'binary-search',
      question: 'In binary search, what must be true before searching an array?',
      options: [
        'The array must be sorted',
        'The array must have unique values',
        'The target must be at index 0',
        'The array length must be even',
      ],
      correct_index: 0,
      difficulty: 'medium',
      explanation: 'Without sorted order, you cannot safely discard half the array each step.',
    },
  ],
};

const EXPLAIN_FALLBACK = {
  concept_id: 'binary-search',
  mode: 'step-by-step',
  explanation:
    '1) Pick the middle item in a sorted list.\n2) Compare it with the target.\n3) Keep only the half that can still contain the target.\n4) Repeat until found or empty.',
};

const SESSION_SUMMARY_FALLBACK = {
  summary:
    '- You reviewed binary search and recursion basics.\n- Strong point: your comparison steps were consistent.\n- Next step: do one medium quiz tomorrow and explain each answer briefly.',
  format: 'bullets',
  conceptsStudied: ['binary-search', 'recursion'],
  sessionMinutes: 25,
};

function writeJson(filename, payload) {
  fs.writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(payload, null, 2));
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('FocusFlow 3D — 預緩存 Demo 回應');
  console.log('BASE_URL:', BASE_URL);
  console.log('輸出目錄:', OUT_DIR);
  console.log('');

  // 1) Ingest
  try {
    const ingest = await fetchJson(`${BASE_URL}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: DEMO_TEXT }),
    });
    if (ingest && ingest.concepts) {
      writeJson('ingest.json', ingest);
      console.log('✓ ingest.json');
    } else {
      console.log('✗ ingest 失敗或無 concepts');
    }
  } catch (e) {
    console.log('✗ ingest', e.message);
  }

  // 2) Quiz
  try {
    const quiz = await fetchJson(`${BASE_URL}/api/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept_id: 'binary-search',
        concept_name: 'Binary Search',
        difficulty: 'medium',
        count: 1,
      }),
    });
    if (quiz && quiz.questions) {
      writeJson('quiz-binary-search-medium.json', quiz);
      console.log('✓ quiz-binary-search-medium.json');
    } else {
      writeJson('quiz-binary-search-medium.json', QUIZ_FALLBACK);
      console.log('✗ quiz 失敗');
      console.log('↺ 使用本地 fallback 寫入 quiz-binary-search-medium.json');
    }
  } catch (e) {
    writeJson('quiz-binary-search-medium.json', QUIZ_FALLBACK);
    console.log('✗ quiz', e.message);
    console.log('↺ 使用本地 fallback 寫入 quiz-binary-search-medium.json');
  }

  // 3) Explain
  try {
    const explain = await fetchJson(`${BASE_URL}/api/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept_id: 'binary-search',
        concept_name: 'Binary Search',
        mode: 'step-by-step',
      }),
    });
    if (explain && explain.explanation) {
      writeJson('explain-binary-search-step-by-step.json', explain);
      console.log('✓ explain-binary-search-step-by-step.json');
    } else {
      writeJson('explain-binary-search-step-by-step.json', EXPLAIN_FALLBACK);
      console.log('✗ explain 失敗');
      console.log('↺ 使用本地 fallback 寫入 explain-binary-search-step-by-step.json');
    }
  } catch (e) {
    writeJson('explain-binary-search-step-by-step.json', EXPLAIN_FALLBACK);
    console.log('✗ explain', e.message);
    console.log('↺ 使用本地 fallback 寫入 explain-binary-search-step-by-step.json');
  }

  // 4) Session summary
  try {
    const summary = await fetchJson(`${BASE_URL}/api/session-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conceptsStudied: ['binary-search', 'recursion'],
        sessionMinutes: 25,
        cognitiveState: 'okay',
      }),
    });
    if (summary && summary.summary) {
      writeJson('session-summary.json', summary);
      console.log('✓ session-summary.json');
    } else {
      writeJson('session-summary.json', SESSION_SUMMARY_FALLBACK);
      console.log('✗ session-summary 失敗');
      console.log('↺ 使用本地 fallback 寫入 session-summary.json');
    }
  } catch (e) {
    writeJson('session-summary.json', SESSION_SUMMARY_FALLBACK);
    console.log('✗ session-summary', e.message);
    console.log('↺ 使用本地 fallback 寫入 session-summary.json');
  }

  console.log('');
  console.log('完成。Fallback 時可讀取 public/demo-cache/*.json');
}

main();
