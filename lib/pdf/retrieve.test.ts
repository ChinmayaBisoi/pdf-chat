import { describe, expect, it } from "vitest";
import { dedupePages } from "@/lib/pdf/retrieve";

describe("dedupePages", () => {
  it("keeps first chunk per page and drops later duplicates", () => {
    const out = dedupePages([
      { page: 1, text: "a" },
      { page: 2, text: "b" },
      { page: 1, text: "ignored" },
    ]);
    expect(out).toEqual([
      { page: 1, text: "a" },
      { page: 2, text: "b" },
    ]);
  });

  it("returns empty for empty input", () => {
    expect(dedupePages([])).toEqual([]);
  });
});
