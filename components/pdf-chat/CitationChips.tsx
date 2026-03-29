"use client";

import { Badge } from "@/components/ui/badge";
import type { Citation } from "@/lib/pdf/types";

interface CitationChipsProps {
  citations: Citation[];
  onPageClick: (page: number) => void;
  allowedPages: Set<number>;
}

export function CitationChips({
  citations,
  onPageClick,
  allowedPages,
}: CitationChipsProps) {
  if (citations.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <span className="text-xs font-medium text-muted-foreground">Sources</span>
      {citations.map((c, i) => {
        const ok = allowedPages.has(c.page);
        return (
          <button
            key={`${c.page}-${i}`}
            type="button"
            onClick={() => {
              ok && onPageClick(c.page);

            }}
            className={ok ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
          >
            <Badge variant={ok ? "secondary" : "outline"}>
              p.{c.page}
              {c.excerpt ? ` · ${c.excerpt.slice(0, 40)}${c.excerpt.length > 40 ? "…" : ""}` : ""}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
