/**
 * GET /api/search — Bookshelf resource search (Person 6 integration wrapper)
 * Provides search results for the bookshelf panel.
 * Uses pre-cached demo data for reliability; can proxy to P3's FastAPI if available.
 *
 * Query: ?topics=binary+search,arrays&per_topic=3
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/rag/supabase";
import { embedText } from "@/rag/embeddings";

interface Resource {
  title: string;
  url: string;
  snippet: string;
  score: number;
  content_type: "article" | "video" | "book";
  source: string;
  topic: string;
  fetched_at?: string;
}

const RESOURCE_CACHE_TABLE = process.env.SUPABASE_RESOURCE_CACHE_TABLE ?? "resource_cache";

const SearchQuerySchema = z.object({
  topics: z.string().trim().optional(),
  per_topic: z.coerce.number().int().min(1).max(10).default(3),
});

async function searchSupabaseVector(topics: string[], limit: number) {
  if (topics.length === 0) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const queryEmbedding = await embedText(topics.join(" "));
    if (!queryEmbedding) return null;

    const { data, error } = await supabase.rpc("match_material_chunks", {
      query_embedding: queryEmbedding,
      match_count: Math.max(limit * 2, 10),
      topic_filter: topics[0] ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }

    const mapped: Resource[] = (data ?? [])
      .map((row: Record<string, unknown>): Resource => ({
        title: typeof row.title === "string" && row.title.length > 0 ? row.title : String(row.url ?? "Resource"),
        url: typeof row.url === "string" ? row.url : "",
        snippet: typeof row.chunk_text === "string" ? row.chunk_text.slice(0, 320) : "",
        score: typeof row.similarity === "number" ? row.similarity : 0,
        content_type: "article",
        source: typeof row.source === "string" ? row.source : "supabase",
        topic: typeof row.topic === "string" ? row.topic : topics[0] ?? "",
      }))
      .filter((r: Resource) => r.url || r.snippet || r.title)
      .slice(0, limit);

    if (mapped.length > 0) {
      return NextResponse.json({
        resources: mapped,
        source: "supabase-vector",
        fetched_at: new Date().toISOString(),
      });
    }
  } catch {
    // swallow and fallback
  }

  return null;
}

// Pre-cached demo resources for reliable demo
const DEMO_RESOURCES: Resource[] = [
  {
    title: "Binary Search Algorithm — GeeksforGeeks",
    url: "https://www.geeksforgeeks.org/binary-search/",
    snippet: "Binary Search is a searching algorithm used in a sorted array by repeatedly dividing the search interval in half.",
    score: 0.95,
    content_type: "article",
    source: "GeeksforGeeks",
    topic: "binary search",
  },
  {
    title: "Binary Search in 100 Seconds — Fireship",
    url: "https://www.youtube.com/watch?v=MFhxShGxHWc",
    snippet: "Learn binary search algorithm in 100 seconds with visual animations and code examples.",
    score: 0.92,
    content_type: "video",
    source: "YouTube",
    topic: "binary search",
  },
  {
    title: "Introduction to Algorithms — CLRS Chapter on Sorting",
    url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/",
    snippet: "The definitive textbook on algorithms covering sorting, searching, graph algorithms, and more.",
    score: 0.88,
    content_type: "book",
    source: "MIT Press",
    topic: "sorting algorithms",
  },
  {
    title: "Visualizing Sorting Algorithms — VisuAlgo",
    url: "https://visualgo.net/en/sorting",
    snippet: "Interactive visualization of sorting algorithms including bubble sort, merge sort, and quicksort.",
    score: 0.90,
    content_type: "article",
    source: "VisuAlgo",
    topic: "sorting algorithms",
  },
  {
    title: "Data Structures: Linked Lists — CS50",
    url: "https://www.youtube.com/watch?v=2T-A_GFuoTo",
    snippet: "Harvard CS50 lecture on linked lists, memory allocation, and pointer operations.",
    score: 0.91,
    content_type: "video",
    source: "YouTube",
    topic: "linked lists",
  },
  {
    title: "Recursion and Backtracking — Khan Academy",
    url: "https://www.khanacademy.org/computing/computer-science/algorithms/recursive-algorithms/a/recursion",
    snippet: "An intuitive introduction to recursive algorithms with visual examples and practice problems.",
    score: 0.89,
    content_type: "article",
    source: "Khan Academy",
    topic: "recursion",
  },
  {
    title: "Understanding Arrays — freeCodeCamp",
    url: "https://www.freecodecamp.org/news/data-structures-101-arrays-a-visual-introduction-for-beginners-7f013bcc355a/",
    snippet: "A visual beginner's guide to arrays, including operations, time complexity, and common patterns.",
    score: 0.87,
    content_type: "article",
    source: "freeCodeCamp",
    topic: "arrays",
  },
  {
    title: "Neural Networks Explained — 3Blue1Brown",
    url: "https://www.youtube.com/watch?v=aircAruvnKk",
    snippet: "Beautiful visual explanation of neural networks, backpropagation, and gradient descent.",
    score: 0.96,
    content_type: "video",
    source: "YouTube",
    topic: "neural networks",
  },
];

export async function GET(request: NextRequest) {
  const queryParsed = SearchQuerySchema.safeParse({
    topics: request.nextUrl.searchParams.get("topics") ?? "",
    per_topic: request.nextUrl.searchParams.get("per_topic") ?? "3",
  });
  if (!queryParsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_QUERY", message: queryParsed.error.issues[0]?.message ?? "Invalid query" } },
      { status: 400 },
    );
  }

  const topics = (queryParsed.data.topics ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const perTopic = queryParsed.data.per_topic;
  const limit = perTopic * Math.max(topics.length, 1);

  // 1a) Direct Supabase RAG vector search (highest priority)
  const supabaseVectorResult = await searchSupabaseVector(topics, limit);
  if (supabaseVectorResult) return supabaseVectorResult;

  // 1b) P3 FastAPI RAG search — delegate embedding + vector search to Person3
  const p3Url = process.env.P3_SCRAPER_URL;
  if (p3Url && topics.length > 0) {
    try {
      const ragRes = await fetch(
        `${p3Url}/rag/search?query=${encodeURIComponent(topics.join(" "))}&top_k=${limit}&as_resources=true`,
        { signal: AbortSignal.timeout(6_000) },
      );
      if (ragRes.ok) {
        const ragData = await ragRes.json();
        const resources: Resource[] = (Array.isArray(ragData.resources) ? ragData.resources : [])
          .map((row: Record<string, unknown>) => ({
            title: typeof row.title === "string" && row.title ? row.title : (typeof row.url === "string" ? row.url : "Resource"),
            url: typeof row.url === "string" ? row.url : "",
            snippet: typeof row.snippet === "string" ? row.snippet.slice(0, 320) : "",
            score: typeof row.score === "number" ? row.score : 0,
            content_type: "article" as const,
            source: typeof row.source === "string" ? row.source : "p3-rag",
            topic: typeof row.topic === "string" ? row.topic : topics[0] ?? "",
          }))
          .filter((r: Resource) => r.url || r.snippet || r.title)
          .slice(0, limit);

        if (resources.length > 0) {
          return NextResponse.json({
            resources,
            source: "p3-rag",
            fetched_at: new Date().toISOString(),
          });
        }
      }
    } catch {
      // P3 not available — fall through to next source
    }
  }

  // 2) Supabase cached resources
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(RESOURCE_CACHE_TABLE)
        .select("title,url,snippet,score,content_type,source,topic,fetched_at")
        .order("score", { ascending: false })
        .limit(Math.max(limit * 2, 10));

      if (error) {
        throw new Error(error.message);
      }

      const mapped = (data ?? [])
        .filter((row) => typeof row.title === "string" && typeof row.url === "string")
        .map((row) => ({
          title: String(row.title),
          url: String(row.url),
          snippet: typeof row.snippet === "string" ? row.snippet : "",
          score: Number.isFinite(Number(row.score)) ? Number(row.score) : 0,
          content_type:
            row.content_type === "video" || row.content_type === "book" ? row.content_type : "article",
          source: typeof row.source === "string" ? row.source : "supabase",
          topic: typeof row.topic === "string" ? row.topic.toLowerCase() : "",
          fetched_at: typeof row.fetched_at === "string" ? row.fetched_at : undefined,
        }))
        .filter((r) =>
          topics.length === 0
            ? true
            : topics.some(
                (t) =>
                  r.topic.includes(t) || r.title.toLowerCase().includes(t) || r.snippet.toLowerCase().includes(t),
              ),
        )
        .slice(0, limit);

      if (mapped.length > 0) {
        const latestFetchedAt = mapped
          .map((r) => r.fetched_at)
          .find((value): value is string => typeof value === "string");
        return NextResponse.json({
          resources: mapped,
          source: "supabase-cache",
          fetched_at: latestFetchedAt ?? new Date().toISOString(),
        });
      }
    } catch {
      // Fall through to P3 / demo data.
    }
  }

  // 2) P3 scraper
  if (p3Url && topics.length > 0) {
    try {
      const res = await fetch(
        `${p3Url}/bookshelf?topics=${encodeURIComponent(topics.join(","))}&per_topic=${perTopic}`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (res.ok) {
        const data = await res.json();
        const resources = Array.isArray(data.resources) ? data.resources : Array.isArray(data) ? data : [];
        if (resources.length > 0) {
          return NextResponse.json({
            resources,
            source: "p3-scraper",
            fetched_at: new Date().toISOString(),
          });
        }
      }
    } catch {
      // Fall through to demo data.
    }
  }

  // 3) Demo fallback
  let results: Resource[];
  if (topics.length > 0) {
    results = DEMO_RESOURCES.filter((r) =>
      topics.some((t) => r.topic.includes(t) || r.title.toLowerCase().includes(t) || r.snippet.toLowerCase().includes(t)),
    );
  } else {
    results = DEMO_RESOURCES;
  }

  // Sort by score, limit
  results.sort((a, b) => b.score - a.score);
  results = results.slice(0, limit);

  return NextResponse.json({
    resources: results,
    source: "demo-cache",
    fetched_at: new Date().toISOString(),
  });
}
