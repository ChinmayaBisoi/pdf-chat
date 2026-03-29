"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CitationChips } from "@/components/pdf-chat/CitationChips";
import type { ChatMessage } from "@/lib/pdf/types";

interface ChatPanelProps {
  documentId: string | null;
  onCitationClick: (page: number) => void;
}

export function ChatPanel({ documentId, onCitationClick }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [documentId]);

  async function send() {
    if (!documentId || !input.trim()) return;
    const text = input.trim();
    setInput("");
    setError(null);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, message: text }),
      });
      const data = (await r.json()) as {
        answer?: string;
        citations?: { page: number; excerpt?: string }[];
        error?: string;
      };
      if (!r.ok) {
        throw new Error(data.error ?? "Request failed");
      }
      const citations = data.citations ?? [];
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer ?? "",
          citations,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="max-h-[320px] min-h-[200px] space-y-3 overflow-y-auto text-sm">
          {messages.length === 0 && (
            <p className="text-muted-foreground">
              Ask a question about your PDF. Answers include page citations you can click.
            </p>
          )}
          {messages.map((msg) => {
            const allowed =
              msg.role === "assistant" && msg.citations
                ? new Set(msg.citations.map((c) => c.page))
                : new Set<number>();
            return (
              <div
                key={msg.id}
                className={
                  msg.role === "user"
                    ? "ml-6 rounded-lg bg-muted px-3 py-2"
                    : "mr-6 rounded-lg border bg-card px-3 py-2"
                }
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "assistant" &&
                  msg.citations &&
                  msg.citations.length > 0 && (
                    <CitationChips
                      citations={msg.citations}
                      allowedPages={allowed}
                      onPageClick={onCitationClick}
                    />
                  )}
              </div>
            );
          })}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <textarea
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] flex-1 resize-none rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={
              documentId
                ? "Ask something about the document…"
                : "Upload a PDF first…"
            }
            value={input}
            disabled={!documentId || loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="button"
            className="self-end"
            disabled={!documentId || loading || !input.trim()}
            onClick={() => void send()}
          >
            {loading ? "…" : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
