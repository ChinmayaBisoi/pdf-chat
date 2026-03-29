"use client";

import dynamic from "next/dynamic";
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
import type { IngestPhase } from "@/lib/pdf/types";

export function PdfWorkspace() {
  const jumpRef = useRef<((page: number) => void) | null>(null);
  const [phase, setPhase] = useState<IngestPhase>("idle");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState("");
  const [credits, setCredits] = useState<number | null>(null);

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

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      {ingestError && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {ingestError}
        </p>
      )}
      <div className="grid flex-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-4">
          <PdfUploader
            phase={phase}
            onPhaseChange={setPhase}
            onReady={({ documentId: id, fileUrl: url }) => {
              setDocumentId(id);
              setFileUrl(url);
              setIngestError("");
            }}
            onError={setIngestError}
            onCreditsRemaining={setCredits}
          />
          <PdfViewerPane fileUrl={fileUrl} jumpRef={jumpRef} />
        </div>
        <ChatPanel
          documentId={documentId}
          onCitationClick={(page) => jumpRef.current?.(page)}
          credits={credits}
          onCreditsChange={setCredits}
        />
      </div>
    </div>
  );
}
