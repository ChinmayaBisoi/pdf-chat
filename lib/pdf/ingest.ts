import { getSql } from "@/lib/db";
import { embedTexts } from "@/lib/ai/embeddings";
import { extractPdfPages } from "@/lib/pdf/extract";

export async function ingestPdfFromUrl(params: {
  clerkUserId: string;
  fileUrl: string;
  uploadThingKey?: string | null;
}): Promise<{ documentId: string }> {
  const sql = getSql();

  const res = await fetch(params.fileUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch PDF: ${res.status}`);
  }
  const buffer = await res.arrayBuffer();

  const pages = await extractPdfPages(buffer);
  const nonEmpty = pages.filter((p) => p.text.length > 0);
  if (nonEmpty.length === 0) {
    throw new Error("No extractable text in this PDF");
  }

  const texts = nonEmpty.map((p) => p.text);
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
}
