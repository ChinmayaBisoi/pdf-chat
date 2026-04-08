import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listProjectsForUser } from "@/lib/db/project-thread";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await listProjectsForUser(userId);
  return NextResponse.json({ projects });
}
