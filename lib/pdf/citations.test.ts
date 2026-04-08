import { describe, expect, it } from "vitest";
import { filterVisibleCitations, hasSearchableExcerpt } from "./citations";

describe("hasSearchableExcerpt", () => {
  it("is true when excerpt has non-whitespace", () => {
    expect(hasSearchableExcerpt({ page: 1, excerpt: " hello " })).toBe(true);
  });

  it("is false when excerpt missing, empty, or whitespace only", () => {
    expect(hasSearchableExcerpt({ page: 1 })).toBe(false);
    expect(hasSearchableExcerpt({ page: 1, excerpt: "" })).toBe(false);
    expect(hasSearchableExcerpt({ page: 1, excerpt: "   " })).toBe(false);
  });
});

describe("filterVisibleCitations", () => {
  const allowed = new Set([1, 2]);

  it("keeps citations on allowed pages with excerpts", () => {
    const out = filterVisibleCitations(
      [
        { page: 1, excerpt: "a" },
        { page: 2, excerpt: "b" },
      ],
      allowed,
    );
    expect(out).toHaveLength(2);
    expect(out[0].excerpt).toBe("a");
  });

  it("drops citations on pages outside the allowed set", () => {
    const out = filterVisibleCitations(
      [{ page: 99, excerpt: "x" }],
      allowed,
    );
    expect(out).toHaveLength(0);
  });

  it("drops citations without searchable excerpts", () => {
    const out = filterVisibleCitations(
      [{ page: 1, excerpt: "" }, { page: 1 }],
      allowed,
    );
    expect(out).toHaveLength(0);
  });
});
