"use client";

import { useState, useEffect } from "react";
import { Book, FileText, Video, Globe, Star, ExternalLink, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFocusFlowStore } from "@/store/useFocusFlowStore";

interface Resource {
  title: string;
  url: string;
  snippet: string;
  score: number;
  content_type: "article" | "video" | "book";
  source?: string;
}

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
    <Card className="p-6 rounded-xl max-w-2xl mx-auto" style={{ maxHeight: "80vh", overflowY: "auto" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Book className="w-5 h-5" /> Bookshelf
        </h3>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200 text-xl">&times;</button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input placeholder="Search resources..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "article", "video", "book"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "secondary"} size="sm" onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}s
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 gap-2">
          <Loader2 className="w-6 h-6 animate-spin" /> Fetching resources...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">No resources found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((r, i) => (
            <Card key={i} className="p-4 border dark:border-neutral-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {typeIcon(r.content_type)}
                  <Badge variant="secondary" className="text-xs">{r.content_type}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>{Math.round(r.score * 100)}%</span>
                </div>
              </div>
              <h4 className="font-medium text-sm mb-1 line-clamp-2">{r.title}</h4>
              <p className="text-xs text-neutral-500 mb-2 line-clamp-2">{r.snippet}</p>
              <Button variant="secondary" size="sm" onClick={() => window.open(r.url, "_blank")}>
                <ExternalLink className="w-3 h-3 mr-1" /> Open
              </Button>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
