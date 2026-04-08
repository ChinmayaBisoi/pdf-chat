"use client";

import { Badge } from "@/components/ui/badge";
import { filterVisibleCitations } from "@/lib/pdf/citations";
import type { Citation } from "@/lib/pdf/types";

interface CitationChipsProps {
  citations: Citation[];
  onCitationClick: (citation: Citation) => void;
  allowedPages: Set<number>;
}

export function CitationChips({
  citations,
  onCitationClick,
  allowedPages,
}: CitationChipsProps) {
  const visible = filterVisibleCitations(citations, allowedPages);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <span className="text-xs font-medium text-muted-foreground">Sources</span>
      {visible.map((c, i) => {
        const ex = c.excerpt.trim();
        return (
          <button
            key={`${c.page}-${i}-${ex.slice(0, 12)}`}
            type="button"
            onClick={() => onCitationClick(c)}
            className="cursor-pointer"
          >
            <Badge variant="secondary">
              p.{c.page}
              {` · ${ex.slice(0, 40)}${ex.length > 40 ? "…" : ""}`}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
