import { describe, expect, it } from "vitest";
import { getPdfPageCount } from "./extract";

describe("pdf extract", () => {
  it("loads pdfjs (DOMMatrix available before pdf.mjs canvas init)", () => {
    expect(getPdfPageCount).toBeTypeOf("function");
  });
});
