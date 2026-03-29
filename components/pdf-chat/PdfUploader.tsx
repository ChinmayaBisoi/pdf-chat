"use client";

import { Loader2 } from "lucide-react";
import { UploadPdfButton } from "@/components/uploadthing-button";
import type { IngestPhase } from "@/lib/pdf/types";
import { cn } from "@/lib/utils";

interface PdfUploaderProps {
  phase: IngestPhase;
  onPhaseChange: (p: IngestPhase) => void;
  onReady: (payload: { documentId: string; fileUrl: string }) => void;
  onError: (message: string) => void;
  onCreditsRemaining?: (n: number) => void;
  /** Full-width centered hero vs compact toolbar control */
  layout?: "hero" | "compact";
  onUploadStart?: () => void;
}

export function PdfUploader({
  phase,
  onPhaseChange,
  onReady,
  onError,
  onCreditsRemaining,
  layout = "hero",
  onUploadStart,
}: PdfUploaderProps) {
  const busy =
    phase === "uploading" || phase === "parsing" || phase === "embedding";

  const isHero = layout === "hero";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        isHero && "w-full max-w-sm items-center",
      )}
    >
      <UploadPdfButton
        endpoint="pdfUploader"
        appearance={{
          container: isHero
            ? "flex w-full flex-col items-center gap-2"
            : "flex flex-col items-end gap-1",
          button: ({ ready, isUploading }) =>
            cn(
              isHero &&
              "w-full max-w-sm rounded-full px-8 py-2.5 text-base font-medium shadow-sm",
              "whitespace-nowrap",
              !ready && "opacity-70",
              isUploading && "cursor-wait",
            ),
          allowedContent: cn(
            "text-xs text-muted-foreground",
            !isHero && "text-right",
          ),
        }}
        content={{
          button: ({ ready }) =>
            ready
              ? isHero
                ? "Select PDF"
                : "Replace PDF"
              : "Preparing…",
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
          onPhaseChange("parsing");
          try {
            onPhaseChange("embedding");
            const r = await fetch("/api/ingest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileUrl: publicFileUrl,
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
            onReady({ documentId: data.documentId, fileUrl: publicFileUrl });
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
        <div
          className={cn(
            "flex items-center gap-2 text-sm text-muted-foreground",
            isHero && "justify-center text-center",
          )}
        >
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
