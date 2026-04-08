/** Limits and pure credit math for PDF ingest (see ingest.ts). */

export const MAX_INDEXED_PAGES = 300;

export function computeMaxBillablePages(pageCount: number): number {
  return Math.min(pageCount, MAX_INDEXED_PAGES);
}

export function computeIngestCreditCost(
  nonEmptyPageCount: number,
  perPageCost: number,
): number {
  return nonEmptyPageCount * perPageCost;
}
