import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import {
  PdfWorkspace,
  type PdfWorkspaceInitialThread,
} from "@/components/pdf-chat/PdfWorkspace";
import { getProjectThread, loadChatMessages } from "@/lib/db/project-thread";

export default async function ChatProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const { projectId } = await params;
  const thread = await getProjectThread(userId, projectId);
  if (!thread) {
    notFound();
  }

  const messages = await loadChatMessages(userId, projectId);

  const initialThread: PdfWorkspaceInitialThread = {
    projectId: thread.projectId,
    documentId: thread.documentId,
    fileUrl: thread.fileUrl,
    title: thread.title,
    messages,
  };

  return (
    <PdfWorkspace key={initialThread.projectId} initialThread={initialThread} />
  );
}
