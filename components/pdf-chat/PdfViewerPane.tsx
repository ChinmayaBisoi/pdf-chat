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
import { searchPlugin } from "@react-pdf-viewer/search";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

import type { Citation } from "@/lib/pdf/types";

const WORKER_URL =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

interface PdfViewerPaneProps {
  fileUrl: string | null;
  jumpRef: React.MutableRefObject<
    ((citation: Citation) => void | Promise<void>) | null
  >;
}

function normalizeQuoteForSearch(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

export function PdfViewerPane({ fileUrl, jumpRef }: PdfViewerPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ReturnType<typeof zoomPlugin> | null>(null);

  const pageNav = pageNavigationPlugin();
  const zoom = zoomPlugin();
  // searchPlugin uses hooks internally; it must run at render top level, not inside useMemo/useEffect.
  const search = searchPlugin({ enableShortcuts: false });

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
    jumpRef.current = async (citation: Citation) => {
      const pageIndex = citation.page - 1;
      pageNav.jumpToPage(pageIndex);

      const raw = citation.excerpt?.trim();
      if (!raw) return;

      search.clearHighlights();
      search.setTargetPages(({ pageIndex: pi }) => pi === pageIndex);

      const runSearch = async (needle: string) => {
        const q = normalizeQuoteForSearch(needle);
        if (!q) return [];
        return search.highlight({
          keyword: q.length > 220 ? q.slice(0, 220) : q,
          matchCase: false,
          wholeWords: false,
        });
      };

      let matches = await runSearch(raw);
      if (!matches || matches.length === 0) {
        const shorter = normalizeQuoteForSearch(raw).slice(0, 72);
        if (shorter.length >= 8) {
          matches = await runSearch(shorter);
        }
      }
    };

    return () => {
      jumpRef.current = null;
    };
  }, [jumpRef, pageNav, search]);

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
            plugins={[zoom, pageNav, search, highlight]}
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
