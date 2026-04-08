"use client";

import { Loader2 } from "lucide-react";
import { UploadPdfButton } from "@/components/uploadthing-button";
import type { IngestPhase } from "@/lib/pdf/types";
import { cn } from "@/lib/utils";

interface PdfUploaderProps {
  phase: IngestPhase;
  onPhaseChange: (p: IngestPhase) => void;
  onReady: (payload: {
    documentId: string;
    fileUrl: string;
    projectId: string;
  }) => void;
  onError: (message: string) => void;
  onCreditsRemaining?: (n: number) => void;
  onUploadStart?: () => void;
}

export function PdfUploader({
  phase,
  onPhaseChange,
  onReady,
  onError,
  onCreditsRemaining,
  onUploadStart,
}: PdfUploaderProps) {
  const busy =
    phase === "uploading" || phase === "parsing" || phase === "embedding";

  const buttonLabel = busy
    ? phase === "uploading"
      ? "Uploading…"
      : phase === "parsing"
        ? "Reading PDF…"
        : "Embedding…"
    : null;

  return (
    <div className={cn("flex w-full max-w-sm flex-col items-center gap-3")}>
      <UploadPdfButton
        endpoint="pdfUploader"
        disabled={busy}
        appearance={{
          container: "flex w-full flex-col items-center gap-2",
          button: ({ ready, isUploading }) =>
            cn(
              "w-full max-w-sm rounded-full px-8 py-2.5 text-base font-medium shadow-sm",
              "whitespace-nowrap",
              !ready && "opacity-70",
              (isUploading || busy) && "cursor-wait",
              busy && "cursor-not-allowed opacity-80",
            ),
          allowedContent: "text-xs text-muted-foreground",
        }}
        content={{
          button: ({ ready }) =>
            buttonLabel ?? (ready ? "Select PDF" : "Preparing…"),
          allowedContent: () => "PDF only, up to 32 MB",
        }}
        onUploadBegin={() => {
          onUploadStart?.();
          onPhaseChange("uploading");
          onError("");
        }}
        onClientUploadComplete={async (res) => {
          const file = res[0];
          const publicFileUrl = file?.ufsUrl ?? file?.url;
          if (!publicFileUrl) {
            onPhaseChange("failed");
            onError("Upload did not return a file URL");
            return;
          }
          const title =
            typeof file.name === "string" && file.name.trim().length > 0
              ? file.name.trim().slice(0, 256)
              : undefined;
          onPhaseChange("parsing");
          try {
            onPhaseChange("embedding");
            const r = await fetch("/api/ingest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileUrl: publicFileUrl,
                uploadThingKey: file.key,
                title,
              }),
            });
            const data = (await r.json()) as {
              documentId?: string;
              projectId?: string;
              error?: string;
              creditsRemaining?: number;
            };
            if (!r.ok) {
              if (typeof data.creditsRemaining === "number") {
                onCreditsRemaining?.(data.creditsRemaining);
              }
              throw new Error(data.error ?? "Ingest failed");
            }
            if (!data.documentId || !data.projectId) {
              throw new Error("No document or chat id returned");
            }
            onReady({
              documentId: data.documentId,
              fileUrl: publicFileUrl,
              projectId: data.projectId,
            });
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
        <div className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>
            {phase === "uploading" && "Uploading…"}
            {phase === "parsing" && "Reading PDF…"}
            {phase === "embedding" &&
              "Embedding pages (this can take a minute)…"}
          </span>
        </div>
      )}
    </div>
  );
}
