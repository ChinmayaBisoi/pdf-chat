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
  title?: string | null;
}): Promise<{ documentId: string; projectId: string }> {
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

  let createdProjectId: string | null = null;
  try {
    const embeddings = await embedTexts(texts);

    const rawTitle = params.title?.trim();
    const projectTitle =
      rawTitle && rawTitle.length > 0 ? rawTitle : "Untitled chat";

    const [project] = await sql`
      INSERT INTO projects (clerk_user_id, title)
      VALUES (${params.clerkUserId}, ${projectTitle})
      RETURNING id
    `;
    const projectId = project.id as string;
    createdProjectId = projectId;

    const [doc] = await sql`
      INSERT INTO documents (project_id, clerk_user_id, file_url, upload_thing_key)
      VALUES (
        ${projectId}::uuid,
        ${params.clerkUserId},
        ${params.fileUrl},
        ${params.uploadThingKey ?? null}
      )
      RETURNING id
    `;

    const documentId = doc.id as string;

    await sql`
      UPDATE projects SET updated_at = NOW() WHERE id = ${projectId}::uuid
    `;

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

    return { documentId, projectId };
  } catch (e) {
    if (createdProjectId) {
      await sql`DELETE FROM projects WHERE id = ${createdProjectId}::uuid`;
    }
    await refundCredits(params.clerkUserId, ingestCost);
    throw e;
  }
}
