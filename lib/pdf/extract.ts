import { PDFParse } from "pdf-parse";

export interface PageChunk {
  page: number;
  text: string;
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
