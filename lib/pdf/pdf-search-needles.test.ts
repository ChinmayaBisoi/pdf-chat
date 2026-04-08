import { describe, expect, it } from "vitest";
import {
  normalizeExcerptForPdfSearch,
  searchNeedlesFromExcerpt,
} from "./pdf-search-needles";

describe("normalizeExcerptForPdfSearch", () => {
  it("collapses whitespace and strips soft hyphens", () => {
    expect(
      normalizeExcerptForPdfSearch("foo\u00ADbar  \n  baz"),
    ).toBe("foobar baz");
  });
});

describe("searchNeedlesFromExcerpt", () => {
  it("returns full string first then shorter variants", () => {
    const needles = searchNeedlesFromExcerpt("one two three four five six seven eight");
    expect(needles[0]).toContain("eight");
    expect(needles.some((n) => n.split(/\s+/).length === 6)).toBe(true);
  });

  it("dedupes", () => {
    const needles = searchNeedlesFromExcerpt("short");
    expect(needles.every((n) => n.length >= 4)).toBe(true);
  });
});
