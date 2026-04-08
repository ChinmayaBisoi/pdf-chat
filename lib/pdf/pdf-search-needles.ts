/**
 * Build search strings for @react-pdf-viewer/search so they match both PDF.js
 * extracted text and the DOM text layer (often slightly different).
 */

const SOFT_HYPHEN = /\u00AD/g;
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;

export function normalizeExcerptForPdfSearch(s: string): string {
  return s
    .normalize("NFKC")
    .replace(SOFT_HYPHEN, "")
    .replace(ZERO_WIDTH, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ordered candidates: try full normalized text, then shorter prefixes and
 * leading word runs so we still find a match when the model paraphrases line breaks.
 */
export function searchNeedlesFromExcerpt(excerpt: string): string[] {
  const norm = normalizeExcerptForPdfSearch(excerpt);
  if (!norm) return [];

  const out: string[] = [norm];

  const words = norm.split(/\s+/).filter(Boolean);
  if (words.length >= 8) {
    out.push(words.slice(0, 6).join(" "));
  }
  if (words.length >= 5) {
    out.push(words.slice(0, 4).join(" "));
  }
  if (words.length >= 3) {
    out.push(words.slice(0, 3).join(" "));
  }

  if (norm.length > 120) {
    out.push(norm.slice(0, 120));
  }
  if (norm.length > 72) {
    out.push(norm.slice(0, 72));
  }
  if (norm.length > 48) {
    out.push(norm.slice(0, 48));
  }

  const seen = new Set<string>();
  return out.filter((n) => {
    const t = n.trim();
    if (t.length < 4) return false;
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  });
}
