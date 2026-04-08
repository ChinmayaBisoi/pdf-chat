import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProjectThread, loadChatMessages } from "@/lib/db/project-thread";
import { projectIdParamSchema } from "@/lib/validation/api-bodies";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId: raw } = await ctx.params;
  const parsed = projectIdParamSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat id" }, { status: 400 });
  }

  const projectId = parsed.data;
  const thread = await getProjectThread(userId, projectId);
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await loadChatMessages(userId, projectId);
  return NextResponse.json({
    project: { id: thread.projectId, title: thread.title },
    document: { id: thread.documentId, fileUrl: thread.fileUrl },
    messages,
  });
}
