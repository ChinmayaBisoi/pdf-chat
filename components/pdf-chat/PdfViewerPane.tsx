"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import {
  ScrollMode,
  SpecialZoomLevel,
  Viewer,
  Worker,
} from "@react-pdf-viewer/core";
import { highlightPlugin, Trigger } from "@react-pdf-viewer/highlight";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

const WORKER_URL =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

interface PdfViewerPaneProps {
  fileUrl: string | null;
  jumpRef: React.MutableRefObject<((page: number) => void) | null>;
}

export function PdfViewerPane({ fileUrl, jumpRef }: PdfViewerPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ReturnType<typeof zoomPlugin> | null>(null);

  const pageNav = pageNavigationPlugin();
  const zoom = zoomPlugin();

  useLayoutEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

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

  useEffect(() => {
    jumpRef.current = (page: number) => {
      pageNav.jumpToPage(page - 1);
    };
    return () => {
      jumpRef.current = null;
    };
  }, [jumpRef, pageNav]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !fileUrl) {
      return;
    }

    let raf = 0;
    const fitPageWidth = () => {
      zoomRef.current?.zoomTo(SpecialZoomLevel.PageWidth);
    };
    const scheduleFit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        fitPageWidth();
      });
    };

    const ro = new ResizeObserver(scheduleFit);
    ro.observe(el);
    scheduleFit();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [fileUrl]);

  if (!fileUrl) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
        Upload a PDF to preview it here.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-[480px] flex-1 flex-col overflow-hidden rounded-lg border bg-background"
    >
      <Worker workerUrl={WORKER_URL}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden [&_.rpv-core__viewer]:min-h-0 [&_.rpv-core__viewer]:h-full">
          <Viewer
            fileUrl={fileUrl}
            plugins={[zoom, pageNav, highlight]}
            defaultScale={SpecialZoomLevel.PageWidth}
            scrollMode={ScrollMode.Vertical}
            onDocumentLoad={() => {
              zoom.zoomTo(SpecialZoomLevel.PageWidth);
            }}
          />
        </div>
      </Worker>
    </div>
  );
}
