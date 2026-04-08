import { describe, expect, it } from "vitest";
import { chunkArray } from "@/lib/ai/embeddings-batch";

describe("chunkArray", () => {
  it("splits into fixed-size batches", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns one batch when length <= batchSize", () => {
    expect(chunkArray(["a", "b"], 10)).toEqual([["a", "b"]]);
  });

  it("returns empty for empty input", () => {
    expect(chunkArray([], 3)).toEqual([]);
  });

  it("throws when batchSize is zero or negative", () => {
    expect(() => chunkArray([1], 0)).toThrow(RangeError);
    expect(() => chunkArray([1], -1)).toThrow(RangeError);
  });
});
