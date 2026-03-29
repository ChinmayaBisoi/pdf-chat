import { getSql } from "@/lib/db";
import {
  getRateLimitChatPerMinute,
  getRateLimitIngestPerHour,
} from "@/lib/usage/config";

export type RateLimitKind = "chat_minute" | "ingest_hour";

function windowId(kind: RateLimitKind): string {
  const now = Date.now();
  if (kind === "chat_minute") {
    return Math.floor(now / 60_000).toString();
  }
  return Math.floor(now / 3_600_000).toString();
}

export async function checkRateLimit(
  clerkUserId: string,
  kind: RateLimitKind,
): Promise<{ ok: true; count: number } | { ok: false; limit: number; count: number }> {
  const sql = getSql();
  const wid = windowId(kind);
  const limit =
    kind === "chat_minute"
      ? getRateLimitChatPerMinute()
      : getRateLimitIngestPerHour();

  const rows = await sql`
    INSERT INTO rate_limit_windows (clerk_user_id, kind, window_id, count)
    VALUES (${clerkUserId}, ${kind}, ${wid}, 1)
    ON CONFLICT (clerk_user_id, kind, window_id)
    DO UPDATE SET count = rate_limit_windows.count + 1
    RETURNING count
  `;

  const count = rows[0]?.count as number;
  if (count > limit) {
    return { ok: false, limit, count };
  }
  return { ok: true, count };
}

export function retryAfterSecondsForKind(kind: RateLimitKind): number {
  if (kind === "chat_minute") {
    const msIntoMinute = Date.now() % 60_000;
    return Math.max(1, Math.ceil((60_000 - msIntoMinute) / 1000));
  }
  const msIntoHour = Date.now() % 3_600_000;
  return Math.max(1, Math.ceil((3_600_000 - msIntoHour) / 1000));
}
