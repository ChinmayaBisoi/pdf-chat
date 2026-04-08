import { describe, expect, it } from "vitest";
import {
  NoExtractableTextError,
  PdfFetchError,
  PdfPageLimitError,
} from "@/lib/pdf/ingest";

describe("ingest error classes", () => {
  it("PdfPageLimitError includes max pages in message", () => {
    const e = new PdfPageLimitError(300);
    expect(e.name).toBe("PdfPageLimitError");
    expect(e.message).toContain("300");
  });

  it("PdfFetchError has stable name", () => {
    const e = new PdfFetchError();
    expect(e.name).toBe("PdfFetchError");
    expect(e.message.length).toBeGreaterThan(0);
  });

  it("NoExtractableTextError has stable name", () => {
    const e = new NoExtractableTextError();
    expect(e.name).toBe("NoExtractableTextError");
  });
});
