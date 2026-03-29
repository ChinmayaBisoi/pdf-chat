import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ingestPdfFromUrl } from "@/lib/pdf/ingest";

const bodySchema = z.object({
  fileUrl: z.url(),
  uploadThingKey: z.string().optional(),
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

  try {
    const { documentId } = await ingestPdfFromUrl({
      clerkUserId: userId,
      fileUrl: parsed.data.fileUrl,
      uploadThingKey: parsed.data.uploadThingKey,
    });
    return NextResponse.json({ documentId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ingest failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
