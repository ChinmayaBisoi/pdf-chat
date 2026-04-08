"use client";

import dynamic from "next/dynamic";
import { MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PdfUploader } from "@/components/pdf-chat/PdfUploader";
import { ChatPanel } from "@/components/pdf-chat/ChatPanel";

const PdfViewerPane = dynamic(
  () =>
    import("@/components/pdf-chat/PdfViewerPane").then((m) => m.PdfViewerPane),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[480px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
        Loading viewer…
      </div>
    ),
  },
);
import type { Citation, IngestPhase } from "@/lib/pdf/types";

export function PdfWorkspace() {
  const jumpRef = useRef<((citation: Citation) => void | Promise<void>) | null>(
    null,
  );
  const [phase, setPhase] = useState<IngestPhase>("idle");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState("");
  const [credits, setCredits] = useState<number | null>(null);

  const showPdfAndChat =
    phase === "ready" && documentId !== null && fileUrl !== null;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch("/api/usage");
        if (!r.ok) return;
        const data = (await r.json()) as { credits?: number };
        if (!cancelled && typeof data.credits === "number") {
          setCredits(data.credits);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  function handleUploadStart() {
    setDocumentId(null);
    setFileUrl(null);
  }

  const uploaderProps = {
    phase,
    onPhaseChange: setPhase,
    onReady: ({
      documentId: id,
      fileUrl: url,
    }: {
      documentId: string;
      fileUrl: string;
    }) => {
      setDocumentId(id);
      setFileUrl(url);
      setIngestError("");
    },
    onError: setIngestError,
    onCreditsRemaining: setCredits,
    onUploadStart: handleUploadStart,
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      {!showPdfAndChat ? (
        <div className="flex min-h-[min(70vh,720px)] flex-1 flex-col items-center justify-center gap-8">
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 text-primary shadow-sm">
              <MessageCircle className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                AI Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                Ask questions about a document and get key takeaways with
                generative AI.
              </p>
            </div>
            <PdfUploader {...uploaderProps} layout="hero" />
            {ingestError ? (
              <p
                role="alert"
                className="max-w-md rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {ingestError}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Document ready. Ask questions in the chat panel.
            </p>
            <PdfUploader {...uploaderProps} layout="compact" />
          </div>
          <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="flex min-h-0 flex-1 flex-col">
              <PdfViewerPane fileUrl={fileUrl} jumpRef={jumpRef} />
            </div>
            <ChatPanel
              documentId={documentId}
              onCitationClick={(citation) => void jumpRef.current?.(citation)}
              credits={credits}
              onCreditsChange={setCredits}
            />
          </div>
        </div>
      )}
    </div>
  );
}
