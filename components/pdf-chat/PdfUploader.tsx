"use client";

import { UploadPdfButton } from "@/components/uploadthing-button";
import type { IngestPhase } from "@/lib/pdf/types";

interface PdfUploaderProps {
  phase: IngestPhase;
  onPhaseChange: (p: IngestPhase) => void;
  onReady: (payload: { documentId: string; fileUrl: string }) => void;
  onError: (message: string) => void;
  onCreditsRemaining?: (n: number) => void;
}

export function PdfUploader({
  phase,
  onPhaseChange,
  onReady,
  onError,
  onCreditsRemaining,
}: PdfUploaderProps) {
  const busy =
    phase === "uploading" || phase === "parsing" || phase === "embedding";

  return (
    <div className="flex flex-col gap-2">
      <UploadPdfButton
        endpoint="pdfUploader"
        content={{
          button: ({ ready }) =>
            ready ? "Choose PDF" : "Preparing…",
          allowedContent: () => "PDF only, up to 32 MB",
        }}
        onUploadBegin={() => {
          onPhaseChange("uploading");
          onError("");
        }}
        onClientUploadComplete={async (res) => {
          const file = res[0];
          if (!file?.url) {
            onPhaseChange("failed");
            onError("Upload did not return a file URL");
            return;
          }
          onPhaseChange("parsing");
          try {
            onPhaseChange("embedding");
            const r = await fetch("/api/ingest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileUrl: file.url,
                uploadThingKey: file.key,
              }),
            });
            const data = (await r.json()) as {
              documentId?: string;
              error?: string;
              creditsRemaining?: number;
            };
            if (!r.ok) {
              if (typeof data.creditsRemaining === "number") {
                onCreditsRemaining?.(data.creditsRemaining);
              }
              throw new Error(data.error ?? "Ingest failed");
            }
            if (!data.documentId) {
              throw new Error("No document id returned");
            }
            onReady({ documentId: data.documentId, fileUrl: file.url });
            onPhaseChange("ready");
          } catch (e) {
            onPhaseChange("failed");
            onError(e instanceof Error ? e.message : "Ingest failed");
          }
        }}
        onUploadError={(e) => {
          onPhaseChange("failed");
          onError(e.message);
        }}
      />
      {busy && (
        <p className="text-sm text-muted-foreground">
          {phase === "uploading" && "Uploading…"}
          {phase === "parsing" && "Reading PDF…"}
          {phase === "embedding" && "Embedding pages (this can take a minute)…"}
        </p>
      )}
    </div>
  );
}
