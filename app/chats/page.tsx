import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listProjectsForUser } from "@/lib/db/project-thread";

function formatUpdatedAt(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

export default async function ChatsPage() {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const projects = await listProjectsForUser(userId);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your chats</h1>
        <p className="text-sm text-muted-foreground">
          Open a saved chat to continue with your document.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          No chats yet.{" "}
          <Link href="/chat" className="text-primary underline-offset-4 hover:underline">
            Start a new chat
          </Link>{" "}
          and upload a PDF.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/chat/${p.id}`}
                className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <span className="font-medium">
                  {p.title?.trim() || "Untitled chat"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Updated {formatUpdatedAt(p.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
