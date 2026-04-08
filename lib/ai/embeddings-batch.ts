/** Split an array into contiguous batches (last batch may be shorter). */
export function chunkArray<T>(items: T[], batchSize: number): T[][] {
  if (batchSize <= 0) {
    throw new RangeError("batchSize must be positive");
  }
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    out.push(items.slice(i, i + batchSize));
  }
  return out;
}
