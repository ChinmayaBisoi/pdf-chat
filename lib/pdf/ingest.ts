import { embedTexts } from "@/lib/ai/embeddings";
import { assertUploadThingFileUrlForIngest } from "@/lib/ingest-file-url";
import { getSql } from "@/lib/db";
import { getCreditCostEmbedPerPage } from "@/lib/usage/config";
import { consumeCredits, getCreditsBalance, refundCredits } from "@/lib/usage/credits";
import { InsufficientCreditsError } from "@/lib/usage/errors";
import { extractPdfPages, getPdfPageCount } from "@/lib/pdf/extract";
import {
  computeIngestCreditCost,
  computeMaxBillablePages,
  MAX_INDEXED_PAGES,
} from "@/lib/pdf/ingest-math";

export class PdfPageLimitError extends Error {
  constructor(maxPages: number) {
    super(`This PDF has too many pages to index (max ${maxPages}).`);
    this.name = "PdfPageLimitError";
  }
}

export class PdfFetchError extends Error {
  constructor() {
    super("Could not download the PDF");
    this.name = "PdfFetchError";
  }
}

export class NoExtractableTextError extends Error {
  constructor() {
    super("No extractable text in this PDF");
    this.name = "NoExtractableTextError";
  }
}

export async function ingestPdfFromUrl(params: {
  clerkUserId: string;
  fileUrl: string;
  uploadThingKey?: string | null;
}): Promise<{ documentId: string }> {
  const sql = getSql();

  assertUploadThingFileUrlForIngest(params.fileUrl);

  const res = await fetch(params.fileUrl);
  if (!res.ok) {
    throw new PdfFetchError();
  }
  const buffer = await res.arrayBuffer();

  const pageCount = await getPdfPageCount(buffer);
  const perPage = getCreditCostEmbedPerPage();
  const maxBillablePages = computeMaxBillablePages(pageCount);
  const maxIngestCost = computeIngestCreditCost(maxBillablePages, perPage);
  const balance = await getCreditsBalance(params.clerkUserId);
  if (balance < maxIngestCost) {
    throw new InsufficientCreditsError();
  }

  const pages = await extractPdfPages(buffer);
  const nonEmpty = pages.filter((p) => p.text.length > 0);
  if (nonEmpty.length === 0) {
    throw new NoExtractableTextError();
  }
  if (nonEmpty.length > MAX_INDEXED_PAGES) {
    throw new PdfPageLimitError(MAX_INDEXED_PAGES);
  }

  const texts = nonEmpty.map((p) => p.text);
  const ingestCost = computeIngestCreditCost(nonEmpty.length, perPage);
  const spent = await consumeCredits(params.clerkUserId, ingestCost);
  if (!spent.ok) {
    throw new InsufficientCreditsError();
  }

  try {
    const embeddings = await embedTexts(texts);

    await sql`DELETE FROM documents WHERE clerk_user_id = ${params.clerkUserId}`;

    const [doc] = await sql`
      INSERT INTO documents (clerk_user_id, file_url, upload_thing_key)
      VALUES (${params.clerkUserId}, ${params.fileUrl}, ${params.uploadThingKey ?? null})
      RETURNING id
    `;

    const documentId = doc.id as string;

    for (let i = 0; i < nonEmpty.length; i++) {
      const page = nonEmpty[i].page;
      const text = nonEmpty[i].text;
      const embedding = embeddings[i];
      const vectorLiteral = JSON.stringify(embedding);
      await sql`
        INSERT INTO chunks (document_id, page, text, embedding)
        VALUES (
          ${documentId}::uuid,
          ${page},
          ${text},
          ${vectorLiteral}::vector
        )
      `;
    }

    return { documentId };
  } catch (e) {
    await refundCredits(params.clerkUserId, ingestCost);
    throw e;
  }
}
