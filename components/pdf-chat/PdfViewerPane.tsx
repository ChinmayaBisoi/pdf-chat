"use client";

import { useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { highlightPlugin, Trigger } from "@react-pdf-viewer/highlight";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

const WORKER_URL =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

interface PdfViewerPaneProps {
  fileUrl: string | null;
  jumpRef: React.MutableRefObject<((page: number) => void) | null>;
}

export function PdfViewerPane({ fileUrl, jumpRef }: PdfViewerPaneProps) {
  const pageNav = pageNavigationPlugin();
  const highlight = highlightPlugin({
    trigger: Trigger.TextSelection,
    renderHighlightTarget: (props) => (
      <div className="flex gap-2 rounded-md border border-border bg-background p-2 shadow-md">
        <button
          type="button"
          className="text-sm font-medium text-primary"
          onClick={props.toggle}
        >
          Save highlight
        </button>
        <button
          type="button"
          className="text-sm text-muted-foreground"
          onClick={props.cancel}
        >
          Cancel
        </button>
      </div>
    ),
    renderHighlightContent: (props) => (
      <div className="max-w-xs rounded-md border bg-background p-3 text-sm shadow">
        <p className="text-muted-foreground">Highlight saved.</p>
        <button
          type="button"
          className="mt-2 text-primary"
          onClick={() => props.cancel()}
        >
          Close
        </button>
      </div>
    ),
  });

  const layout = defaultLayoutPlugin();

  useEffect(() => {
    jumpRef.current = (page: number) => {
      pageNav.jumpToPage(page - 1);
    };
    return () => {
      jumpRef.current = null;
    };
  }, [jumpRef, pageNav]);

  if (!fileUrl) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
        Upload a PDF to preview it here.
      </div>
    );
  }

  return (
    <div className="h-full min-h-[480px] overflow-hidden rounded-lg border bg-background">
      <Worker workerUrl={WORKER_URL}>
        <Viewer
          fileUrl={fileUrl}
          plugins={[layout, pageNav, highlight]}
          defaultScale={1}
        />
      </Worker>
    </div>
  );
}
