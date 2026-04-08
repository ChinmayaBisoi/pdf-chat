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

  it("preserves order of first occurrence per page", () => {
    expect(
      dedupePages([
        { page: 3, text: "c" },
        { page: 1, text: "a" },
        { page: 3, text: "skip" },
      ]),
    ).toEqual([
      { page: 3, text: "c" },
      { page: 1, text: "a" },
    ]);
  });
});
