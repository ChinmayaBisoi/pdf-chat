import { describe, expect, it } from "vitest";
import {
  computeIngestCreditCost,
  computeMaxBillablePages,
  MAX_INDEXED_PAGES,
} from "@/lib/pdf/ingest-math";

describe("ingest-math", () => {
  it("caps billable pages at MAX_INDEXED_PAGES", () => {
    expect(computeMaxBillablePages(50)).toBe(50);
    expect(computeMaxBillablePages(MAX_INDEXED_PAGES + 999)).toBe(
      MAX_INDEXED_PAGES,
    );
  });

  it("computeIngestCreditCost multiplies pages by per-page cost", () => {
    expect(computeIngestCreditCost(10, 3)).toBe(30);
    expect(computeIngestCreditCost(0, 5)).toBe(0);
  });
});
