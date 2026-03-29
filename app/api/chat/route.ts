import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { generateCitationAnswer } from "@/lib/ai/citation-chat";
import { dedupePages, retrieveChunksForQuery } from "@/lib/pdf/retrieve";

const bodySchema = z.object({
  documentId: z.uuid(),
  message: z.string().min(1).max(12_000),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { documentId, message } = parsed.data;
  const sql = getSql();

  const [doc] = await sql`
    SELECT id FROM documents
    WHERE id = ${documentId}::uuid AND clerk_user_id = ${userId}
  `;

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    const chunks = await retrieveChunksForQuery({
      documentId,
      query: message,
      limit: 12,
    });

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No indexed content for this document. Try re-uploading." },
        { status: 422 },
      );
    }

    const deduped = dedupePages(chunks);
    const allowedPages = [...new Set(deduped.map((c) => c.page))];

    const result = await generateCitationAnswer({
      userMessage: message,
      contextBlocks: deduped,
      allowedPages,
    });

    return NextResponse.json({ ...result, allowedPages });
  } catch (e) {
    console.error("chat failed", e);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
