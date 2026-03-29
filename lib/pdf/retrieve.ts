import { getSql } from "@/lib/db";
import { embedQuery } from "@/lib/ai/embeddings";

export interface RetrievedChunk {
  page: number;
  text: string;
}

export async function retrieveChunksForQuery(params: {
  documentId: string;
  query: string;
  limit: number;
}): Promise<RetrievedChunk[]> {
  const sql = getSql();
  const embedding = await embedQuery(params.query);
  const vectorLiteral = JSON.stringify(embedding);

  const rows = await sql`
    SELECT page, text
    FROM chunks
    WHERE document_id = ${params.documentId}::uuid
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${params.limit}
  `;

  return rows.map((r) => ({
    page: r.page as number,
    text: r.text as string,
  }));
}

export function dedupePages(chunks: RetrievedChunk[]): RetrievedChunk[] {
  const seen = new Set<number>();
  const out: RetrievedChunk[] = [];
  for (const c of chunks) {
    if (seen.has(c.page)) continue;
    seen.add(c.page);
    out.push(c);
  }
  return out;
}
