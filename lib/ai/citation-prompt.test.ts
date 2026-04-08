import { describe, expect, it } from "vitest";
import {
  formatAllowedPagesForPrompt,
  formatPdfContextForPrompt,
} from "@/lib/ai/citation-prompt";

describe("formatPdfContextForPrompt", () => {
  it("formats blocks with page headers and blank lines between", () => {
    expect(
      formatPdfContextForPrompt([
        { page: 2, text: "hello" },
        { page: 1, text: "world" },
      ]),
    ).toBe("--- Page 2 ---\nhello\n\n--- Page 1 ---\nworld");
  });

  it("returns empty string for empty blocks", () => {
    expect(formatPdfContextForPrompt([])).toBe("");
  });
});

describe("formatAllowedPagesForPrompt", () => {
  it("sorts ascending and joins with comma space", () => {
    expect(formatAllowedPagesForPrompt([10, 2, 5])).toBe("2, 5, 10");
  });

  it("does not mutate the input array", () => {
    const pages = [3, 1];
    formatAllowedPagesForPrompt(pages);
    expect(pages).toEqual([3, 1]);
  });

  it("handles empty list", () => {
    expect(formatAllowedPagesForPrompt([])).toBe("");
  });
});
