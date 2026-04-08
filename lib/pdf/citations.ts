import type { Citation } from "@/lib/pdf/types";

export function hasSearchableExcerpt(
  c: Citation,
): c is Citation & { excerpt: string } {
  return typeof c.excerpt === "string" && c.excerpt.trim().length > 0;
}

/** Citations we can jump+search-highlight in the PDF (allowed page + non-empty excerpt). */
export function filterVisibleCitations(
  citations: Citation[],
  allowedPages: Set<number>,
): Array<Citation & { excerpt: string }> {
  return citations.filter(
    (c): c is Citation & { excerpt: string } =>
      allowedPages.has(c.page) && hasSearchableExcerpt(c),
  );
}
