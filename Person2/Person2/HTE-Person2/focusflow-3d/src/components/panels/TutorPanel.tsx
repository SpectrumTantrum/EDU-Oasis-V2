"use client";

import { useState, useRef, useEffect } from "react";
import { Brain, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFocusFlowStore } from "@/store/useFocusFlowStore";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function TutorPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI tutor. I know your learning style and can help with any concept. What would you like to explore?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const learnerState = useFocusFlowStore((s) => s.learnerState);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          learnerState,
        }),
      });

      if (!res.ok) throw new Error("Tutor API failed");

      // Stream the response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantContent };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't connect. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 rounded-xl max-w-lg mx-auto flex flex-col" style={{ maxHeight: "80vh" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5" /> AI Tutor
        </h3>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200 text-xl">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-2 border rounded-lg dark:border-neutral-700 min-h-[250px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === "user" ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100" : "bg-neutral-100 dark:bg-neutral-800"}`}>
              {msg.content || (isLoading && i === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : null)}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Ask about any concept..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="rounded-full">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
