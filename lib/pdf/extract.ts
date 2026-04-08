import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import "./install-pdfjs-node-polyfills";
import { PDFParse } from "pdf-parse";

/**
 * pdf.js fake-worker path is relative (`./pdf.worker.mjs`). Next bundles that
 * into `.next/.../chunks/` and the import breaks. Point at the real file on disk.
 * Prefer pdf-parse's nested pdfjs (must match its API); fall back to hoisted pdfjs-dist.
 */
function resolvePdfWorkerFileUrl(): string {
  const root = /* turbopackIgnore: true */ process.cwd();
  const candidates = [
    path.join(
      root,
      "node_modules/pdf-parse/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ),
    path.join(root, "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return pathToFileURL(p).href;
    }
  }
  throw new Error(
    "Could not find pdf.worker.mjs (install pdf-parse / pdfjs-dist).",
  );
}

let workerConfigured = false;
function ensurePdfWorkerConfigured() {
  if (workerConfigured) return;
  PDFParse.setWorker(resolvePdfWorkerFileUrl());
  workerConfigured = true;
}

export interface PageChunk {
  page: number;
  text: string;
}

/**
 * pdf.js may transfer the underlying buffer to a worker, detaching it. Always
 * pass a copy into PDFParse so the same ArrayBuffer can be used twice (e.g.
 * getPdfPageCount then extractPdfPages in ingest).
 */
function uint8FromBuffer(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer.slice(0));
}

/** Page count only (loads document metadata, not full text per page). */
export async function getPdfPageCount(buffer: ArrayBuffer): Promise<number> {
  ensurePdfWorkerConfigured();
  const data = uint8FromBuffer(buffer);
  const parser = new PDFParse({ data });
  try {
    const info = await parser.getInfo({});
    return info.total;
  } finally {
    await parser.destroy();
  }
}

export async function extractPdfPages(buffer: ArrayBuffer): Promise<PageChunk[]> {
  ensurePdfWorkerConfigured();
  const data = uint8FromBuffer(buffer);
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
