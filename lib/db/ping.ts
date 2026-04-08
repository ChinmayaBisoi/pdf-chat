import { getSql } from "@/lib/db";

export type DbPingResult =
  | { ok: true; latencyMs: number }
  | { ok: false; error: string };

/** Lightweight query to wake Neon compute and measure connectivity. */
export async function pingDatabase(): Promise<DbPingResult> {
  const start = Date.now();
  try {
    const sql = getSql();
    await sql`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - start };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, error };
  }
}
