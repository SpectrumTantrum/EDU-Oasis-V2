'use client';

/**
 * 內容擷取示範 — 呼叫 /api/ingest 後將知識圖寫入 Zustand（新需求 2-8h：structured JSON in local state）
 */
import { useState } from 'react';
import { useFocusFlowStore } from '@/store/useFocusFlowStore';

const DEMO_TEXT =
  'Binary search works on sorted arrays. It divides the array in half and compares the target. Time complexity is O(log n). Prerequisites: arrays, sorting.';

export default function IngestDemoPage() {
  const setKnowledgeGraph = useFocusFlowStore((s) => s.setKnowledgeGraph);
  const knowledgeGraph = useFocusFlowStore((s) => s.knowledgeGraph);
  const [text, setText] = useState(DEMO_TEXT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runIngest = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      setKnowledgeGraph(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-xl font-semibold">Ingest 示範 — 知識圖寫入 Zustand</h1>
      <textarea
        className="mb-2 w-full rounded border border-gray-300 p-2 font-mono text-sm"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="輸入或貼上教材文字..."
      />
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={runIngest}
          disabled={loading || text.length < 50}
          className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? '擷取中…' : '擷取概念並存入 Zustand'}
        </button>
      </div>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      {knowledgeGraph && (
        <div className="rounded border border-gray-200 bg-gray-50 p-3">
          <h2 className="mb-2 font-medium">目前 Zustand 中的知識圖</h2>
          <p className="text-sm text-gray-600">概念數: {knowledgeGraph.concepts.length}，邊數: {knowledgeGraph.edges.length}</p>
          <ul className="mt-2 list-inside list-disc text-sm">
            {knowledgeGraph.concepts.slice(0, 8).map((c) => (
              <li key={c.concept_id}>{c.name} ({c.concept_id})</li>
            ))}
            {knowledgeGraph.concepts.length > 8 && <li>…等 {knowledgeGraph.concepts.length} 個概念</li>}
          </ul>
        </div>
      )}
      <p className="mt-4 text-sm text-gray-500">
        <a href="/tutor" className="underline">前往導師聊天</a>（會使用 store 中的 learnerState）
      </p>
    </div>
  );
}
