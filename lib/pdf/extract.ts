import { PDFParse } from "pdf-parse";

export interface PageChunk {
  page: number;
  text: string;
}

/** Page count only (loads document metadata, not full text per page). */
export async function getPdfPageCount(buffer: ArrayBuffer): Promise<number> {
  const data = new Uint8Array(buffer);
  const parser = new PDFParse({ data });
  try {
    const info = await parser.getInfo({});
    return info.total;
  } finally {
    await parser.destroy();
  }
}

export async function extractPdfPages(buffer: ArrayBuffer): Promise<PageChunk[]> {
  const data = new Uint8Array(buffer);
  const parser = new PDFParse({ data });
  try {
    const textResult = await parser.getText();
    return textResult.pages.map((p) => ({
      page: p.num,
      text: p.text.trim(),
    }));
  } finally {
    await parser.destroy();
  }
}
