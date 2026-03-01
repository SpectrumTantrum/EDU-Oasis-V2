"use client";

import { useState, useEffect } from "react";
import { Book, FileText, Video, Globe, Star, ExternalLink, Search, Loader2 } from "lucide-react";
import { useFocusFlowStore } from "@/store/useFocusFlowStore";

interface Resource {
  title: string;
  url: string;
  snippet: string;
  score: number;
  content_type: "article" | "video" | "book";
  source?: string;
}

const filterLabels: Record<string, string> = {
  all: "All Tomes",
  article: "Scrolls",
  video: "Visions",
  book: "Grimoires",
};

export function BookshelfPanel({ onClose }: { onClose: () => void }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const { knowledgeGraph } = useFocusFlowStore();
  const topics = knowledgeGraph?.concepts.map((c) => c.name).slice(0, 5).join(",") ?? "computer science";

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?topics=${encodeURIComponent(topics)}&per_topic=3`);
        const data = await res.json();
        setResources(data.resources ?? []);
      } catch {
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [topics]);

  const filtered = resources.filter((r) => {
    const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || r.content_type === filter;
    return matchesSearch && matchesFilter;
  });

  const typeIcon = (t: string) => {
    if (t === "video") return <Video className="w-4 h-4" />;
    if (t === "book") return <Book className="w-4 h-4" />;
    if (t === "article") return <FileText className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div
      className="max-w-2xl mx-auto rounded-lg"
      style={{
        maxHeight: "80vh",
        overflowY: "auto",
        background: "linear-gradient(180deg, #3a2a1a 0%, #2a1e12 100%)",
        border: "3px solid #8b6914",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.4), 0 0 20px rgba(0,0,0,0.6), 0 0 0 1px #5a4310",
        imageRendering: "auto",
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: "linear-gradient(180deg, #5a3d1e 0%, #4a3018 100%)",
          borderBottom: "2px solid #8b6914",
        }}
      >
        <h3
          className="flex items-center gap-2 text-lg tracking-wide"
          style={{
            color: "#f0d68a",
            fontFamily: "Georgia, 'Times New Roman', serif",
            textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
          }}
        >
          <Book className="w-5 h-5" style={{ color: "#d4a843" }} />
          Bookshelf
        </h3>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-7 h-7 rounded transition-colors"
          style={{
            color: "#c9a84c",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid #6b5020",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,69,20,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.3)"; }}
        >
          &times;
        </button>
      </div>

      <div className="p-5">
        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "#9a7b4f" }}
          />
          <input
            placeholder="Search the archives..."
            className="w-full pl-10 pr-3 py-2 text-sm rounded outline-none transition-colors"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid #6b5020",
              color: "#e8d5a3",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#c9a84c"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#6b5020"; }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["all", "article", "video", "book"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-xs rounded transition-all"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                letterSpacing: "0.5px",
                ...(filter === f
                  ? {
                      background: "linear-gradient(180deg, #c9a84c 0%, #8b6914 100%)",
                      color: "#1a0e04",
                      border: "1px solid #d4a843",
                      boxShadow: "0 0 6px rgba(201,168,76,0.3)",
                      fontWeight: 600,
                    }
                  : {
                      background: "rgba(0,0,0,0.25)",
                      color: "#b8a070",
                      border: "1px solid #5a4310",
                    }),
              }}
              onMouseEnter={(e) => {
                if (filter !== f) e.currentTarget.style.borderColor = "#8b6914";
              }}
              onMouseLeave={(e) => {
                if (filter !== f) e.currentTarget.style.borderColor = "#5a4310";
              }}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div
            className="flex items-center justify-center h-40 gap-2"
            style={{
              color: "#b8a070",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#c9a84c" }} />
            Consulting the archives...
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-10"
            style={{
              color: "#7a6840",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
            }}
          >
            The shelves are bare. No tomes were found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((r, i) => (
              <div
                key={i}
                className="rounded p-4 transition-colors"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid #5a4310",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#8b6914";
                  e.currentTarget.style.background = "rgba(139,105,20,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#5a4310";
                  e.currentTarget.style.background = "rgba(0,0,0,0.2)";
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#c9a84c" }}>{typeIcon(r.content_type)}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(139,105,20,0.25)",
                        color: "#c9a84c",
                        border: "1px solid #5a4310",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      {r.content_type === "article" ? "scroll" : r.content_type === "video" ? "vision" : "grimoire"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "#b8a070" }}>
                    <Star className="w-3 h-3" style={{ color: "#d4a843", fill: "#d4a843" }} />
                    <span>{Math.round(r.score * 100)}%</span>
                  </div>
                </div>
                <h4
                  className="text-sm mb-1 line-clamp-2"
                  style={{
                    color: "#e8d5a3",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontWeight: 500,
                  }}
                >
                  {r.title}
                </h4>
                <p
                  className="text-xs mb-3 line-clamp-2"
                  style={{ color: "#8a7550" }}
                >
                  {r.snippet}
                </p>
                <button
                  onClick={() => window.open(r.url, "_blank")}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors"
                  style={{
                    background: "rgba(139,105,20,0.2)",
                    color: "#c9a84c",
                    border: "1px solid #6b5020",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139,105,20,0.4)";
                    e.currentTarget.style.borderColor = "#c9a84c";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(139,105,20,0.2)";
                    e.currentTarget.style.borderColor = "#6b5020";
                  }}
                >
                  <ExternalLink className="w-3 h-3" /> Examine
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer ornament */}
      <div
        className="text-center py-2 text-xs tracking-widest"
        style={{
          color: "#5a4310",
          borderTop: "1px solid rgba(139,105,20,0.3)",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        &#x2726; &#x2726; &#x2726;
      </div>
    </div>
  );
}
