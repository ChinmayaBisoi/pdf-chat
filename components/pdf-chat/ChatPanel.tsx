"use client";

import { useChat } from "@ai-sdk/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CitationChips } from "@/components/pdf-chat/CitationChips";
import type { Citation } from "@/lib/pdf/types";
import "streamdown/styles.css";

interface ChatPanelProps {
  documentId: string | null;
  onCitationClick: (citation: Citation) => void;
  credits: number | null;
  onCreditsChange: (n: number) => void;
}

function userMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function assistantAnswerText(parts: UIMessage["parts"]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function assistantCitations(parts: UIMessage["parts"]): Citation[] {
  for (const p of parts) {
    if (p.type === "data-citations" && "data" in p) {
      const data = p.data;
      return Array.isArray(data) ? (data as Citation[]) : [];
    }
  }
  return [];
}

function hasCitationsPart(parts: UIMessage["parts"]): boolean {
  return parts.some((p) => p.type === "data-citations");
}

function lastTextPartState(
  parts: UIMessage["parts"],
): "streaming" | "done" | undefined {
  const textParts = parts.filter((p) => p.type === "text");
  const last = textParts[textParts.length - 1];
  if (!last || last.type !== "text") return undefined;
  const s = last.state;
  if (s === "streaming" || s === "done") return s;
  return undefined;
}

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

function AssistantPhaseRow({
  parts,
  status,
  hasAnswerText,
}: {
  parts: UIMessage["parts"];
  status: ChatStatus;
  hasAnswerText: boolean;
}) {
  const busy = status === "submitted" || status === "streaming";
  if (!busy) return null;

  const citationsDone = hasCitationsPart(parts);
  const textState = lastTextPartState(parts);

  let label: string | null = null;
  if (!hasAnswerText) {
    label = status === "submitted" ? "Connecting…" : "Thinking…";
  } else if (!citationsDone && (textState === "streaming" || textState === undefined)) {
    label = "Writing…";
  } else if (!citationsDone && textState === "done") {
    label = "Sourcing citations…";
  }

  if (!label) return null;

  return (
    <div
      className="mt-2 flex items-center gap-2 border-t border-border/60 pt-2 text-xs text-muted-foreground"
      aria-live="polite"
    >
      <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function ChatPanel({
  documentId,
  onCitationClick,
  credits,
  onCreditsChange,
}: ChatPanelProps) {
  const documentIdRef = useRef(documentId);
  documentIdRef.current = documentId;

  const allowedPagesRef = useRef<number[]>([]);
  const [allowedByMessageId, setAllowedByMessageId] = useState<
    Map<string, number[]>
  >(() => new Map());

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => {
          const last = messages[messages.length - 1];
          const text = userMessageText(last);
          return {
            body: {
              documentId: documentIdRef.current,
              message: text,
            },
          };
        },
        fetch: async (url, init) => {
          const res = await fetch(url, init);
          if (!res.ok) {
            const ct = res.headers.get("content-type") ?? "";
            if (ct.includes("application/json")) {
              const j = (await res.json()) as { error?: string };
              throw new Error(
                typeof j.error === "string" ? j.error : `Request failed (${res.status})`,
              );
            }
            throw new Error(await res.text());
          }
          const cred = res.headers.get("X-Credits-Remaining");
          if (cred != null) {
            const n = Number(cred);
            if (!Number.isNaN(n)) onCreditsChange(n);
          }
          const pagesRaw = res.headers.get("X-Allowed-Pages");
          if (pagesRaw) {
            try {
              const parsed = JSON.parse(pagesRaw) as unknown;
              if (
                Array.isArray(parsed) &&
                parsed.every((x) => typeof x === "number")
              ) {
                allowedPagesRef.current = parsed;
              }
            } catch {
              /* ignore */
            }
          }
          return res;
        },
      }),
    [onCreditsChange],
  );

  const { messages, sendMessage, status, error, setMessages, stop } = useChat({
    id: documentId ?? "no-document",
    experimental_throttle: 50,
    transport,
    onFinish: ({ message }: { message: UIMessage }) => {
      if (message.role === "assistant") {
        setAllowedByMessageId((prev) => {
          const next = new Map(prev);
          next.set(message.id, [...allowedPagesRef.current]);
          return next;
        });
      }
    },
  });

  useEffect(() => {
    setMessages([]);
    setAllowedByMessageId(new Map());
  }, [documentId, setMessages]);

  const [input, setInput] = useState("");
  const loading = status === "submitted" || status === "streaming";
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  const scrollChatToBottom = useCallback(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    scrollChatToBottom();
  }, [messages, status, scrollChatToBottom]);

  useEffect(() => {
    if (!loading) return;
    scrollChatToBottom();
    const id = window.setInterval(scrollChatToBottom, 80);
    return () => window.clearInterval(id);
  }, [loading, scrollChatToBottom]);

  const submit = useCallback(async () => {
    if (!documentId || !input.trim()) return;
    const text = input.trim();
    setInput("");
    await sendMessage({ text });
  }, [documentId, input, sendMessage]);

  return (
    <Card className="flex h-full min-h-0 max-h-[80dvh] flex-col border shadow-sm">
      <CardHeader className="shrink-0 pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle className="text-base">Chat</CardTitle>
          {credits !== null && (
            <span className="text-xs tabular-nums text-muted-foreground">
              Credits: {credits}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <div
          ref={messagesScrollRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain text-sm"
        >
          {messages.length === 0 && (
            <p className="text-muted-foreground">
              Ask a question about your PDF. Answers stream in with page
              citations you can click.
            </p>
          )}
          {messages.map((msg: UIMessage) => {
            const isLast = messages[messages.length - 1]?.id === msg.id;
            const assistantStreaming =
              msg.role === "assistant" &&
              isLast &&
              (status === "streaming" || status === "submitted");
            const answerText =
              msg.role === "assistant" ? assistantAnswerText(msg.parts) : "";

            const citations =
              msg.role === "assistant" ? assistantCitations(msg.parts) : [];
            const allowedList =
              msg.role === "assistant"
                ? (allowedByMessageId.get(msg.id) ??
                  (assistantStreaming ? allowedPagesRef.current : []))
                : [];
            const allowed =
              allowedList.length > 0
                ? new Set(allowedList)
                : new Set(citations.map((c) => c.page));

            return (
              <div
                key={msg.id}
                className={
                  msg.role === "user"
                    ? "ml-6 rounded-lg bg-muted px-3 py-2"
                    : "mr-6 rounded-lg border bg-card px-3 py-2"
                }
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap">{userMessageText(msg)}</p>
                ) : (
                  <>
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1">
                      <Streamdown
                        mode={assistantStreaming ? "streaming" : "static"}
                        parseIncompleteMarkdown={assistantStreaming}
                      >
                        {assistantAnswerText(msg.parts)}
                      </Streamdown>
                    </div>
                    {citations.length > 0 && (
                      <CitationChips
                        citations={citations}
                        allowedPages={allowed}
                        onCitationClick={onCitationClick}
                      />
                    )}
                    {msg.role === "assistant" && isLast && (
                      <AssistantPhaseRow
                        parts={msg.parts}
                        status={status}
                        hasAnswerText={answerText.trim().length > 0}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
          {loading &&
            messages.length > 0 &&
            messages[messages.length - 1]?.role === "user" && (
              <div
                className="mr-6 flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
                aria-live="polite"
              >
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
                Starting reply…
              </div>
            )}
        </div>
        {error && (
          <p className="shrink-0 text-sm text-destructive">
            {error.message || "Chat failed"}
          </p>
        )}
        <div className="flex shrink-0 gap-2">
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
                void submit();
              }
            }}
          />
          <div className="flex flex-col gap-1 self-end">
            <Button
              type="button"
              disabled={!documentId || loading || !input.trim()}
              onClick={() => void submit()}
            >
              {loading ? "…" : "Send"}
            </Button>
            {loading && (
              <Button
                type="button"
                variant="outline"
                className="text-xs"
                onClick={() => void stop()}
              >
                Stop
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
