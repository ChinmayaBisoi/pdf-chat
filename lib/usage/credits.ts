import { getSql } from "@/lib/db";
import { getInitialUserCredits } from "@/lib/usage/config";

export async function ensureUserCreditsRow(clerkUserId: string): Promise<void> {
  const sql = getSql();
  const initial = getInitialUserCredits();
  await sql`
    INSERT INTO user_credits (clerk_user_id, balance)
    VALUES (${clerkUserId}, ${initial})
    ON CONFLICT (clerk_user_id) DO NOTHING
  `;
}

export async function getCreditsBalance(clerkUserId: string): Promise<number> {
  const sql = getSql();
  await ensureUserCreditsRow(clerkUserId);
  const [row] = await sql`
    SELECT balance FROM user_credits WHERE clerk_user_id = ${clerkUserId}
  `;
  return row?.balance as number;
}

export async function consumeCredits(
  clerkUserId: string,
  cost: number,
): Promise<{ ok: true; balance: number } | { ok: false }> {
  if (cost <= 0) {
    const balance = await getCreditsBalance(clerkUserId);
    return { ok: true, balance };
  }
  const sql = getSql();
  const initial = getInitialUserCredits();
  await sql`
    INSERT INTO user_credits (clerk_user_id, balance)
    VALUES (${clerkUserId}, ${initial})
    ON CONFLICT (clerk_user_id) DO NOTHING
  `;

  const rows = await sql`
    UPDATE user_credits
    SET balance = balance - ${cost}, updated_at = NOW()
    WHERE clerk_user_id = ${clerkUserId} AND balance >= ${cost}
    RETURNING balance
  `;

  if (rows.length === 0) {
    return { ok: false };
  }
  return { ok: true, balance: rows[0].balance as number };
}

export async function refundCredits(
  clerkUserId: string,
  amount: number,
): Promise<void> {
  if (amount <= 0) return;
  const sql = getSql();
  await sql`
    UPDATE user_credits
    SET balance = balance + ${amount}, updated_at = NOW()
    WHERE clerk_user_id = ${clerkUserId}
  `;
}
