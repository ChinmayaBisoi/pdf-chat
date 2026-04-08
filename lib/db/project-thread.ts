import type { UIMessage } from "ai";
import { getSql } from "@/lib/db";

export interface ProjectListRow {
  id: string;
  title: string | null;
  updatedAt: string;
}

export interface ProjectThreadRow {
  projectId: string;
  title: string | null;
  documentId: string;
  fileUrl: string;
}

export async function listProjectsForUser(
  clerkUserId: string,
): Promise<ProjectListRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, title, updated_at AS "updatedAt"
    FROM projects
    WHERE clerk_user_id = ${clerkUserId}
    ORDER BY updated_at DESC
  `;
  return rows.map((r) => {
    const u = r.updatedAt;
    const updatedAt =
      u instanceof Date ? u.toISOString() : String(u);
    return {
      id: r.id as string,
      title: r.title as string | null,
      updatedAt,
    };
  });
}

export async function getProjectThread(
  clerkUserId: string,
  projectId: string,
): Promise<ProjectThreadRow | null> {
  const sql = getSql();
  const [row] = await sql`
    SELECT
      p.id AS "projectId",
      p.title,
      d.id AS "documentId",
      d.file_url AS "fileUrl"
    FROM projects p
    INNER JOIN documents d ON d.project_id = p.id
    WHERE p.id = ${projectId}::uuid AND p.clerk_user_id = ${clerkUserId}
  `;
  if (!row) return null;
  return {
    projectId: row.projectId as string,
    title: row.title as string | null,
    documentId: row.documentId as string,
    fileUrl: row.fileUrl as string,
  };
}

export async function loadChatMessages(
  clerkUserId: string,
  projectId: string,
): Promise<UIMessage[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT m.id, m.role, m.parts
    FROM chat_messages m
    INNER JOIN projects p ON p.id = m.project_id
    WHERE m.project_id = ${projectId}::uuid AND p.clerk_user_id = ${clerkUserId}
    ORDER BY m.sort_index ASC
  `;
  return rows.map((r) => ({
    id: r.id as string,
    role: r.role as UIMessage["role"],
    parts: r.parts as UIMessage["parts"],
  }));
}

async function nextSortIndex(projectId: string): Promise<number> {
  const sql = getSql();
  const [row] = await sql`
    SELECT COALESCE(MAX(sort_index), -1) + 1 AS n
    FROM chat_messages
    WHERE project_id = ${projectId}::uuid
  `;
  return Number(row?.n ?? 0);
}

async function touchProject(projectId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE projects SET updated_at = NOW() WHERE id = ${projectId}::uuid
  `;
}

export async function insertChatMessage(params: {
  projectId: string;
  id: string;
  role: "user" | "assistant";
  parts: UIMessage["parts"];
}): Promise<void> {
  const sql = getSql();
  const sortIndex = await nextSortIndex(params.projectId);
  const partsJson = JSON.stringify(params.parts);
  await sql`
    INSERT INTO chat_messages (id, project_id, role, parts, sort_index)
    VALUES (
      ${params.id},
      ${params.projectId}::uuid,
      ${params.role},
      ${partsJson}::jsonb,
      ${sortIndex}
    )
  `;
  await touchProject(params.projectId);
}
