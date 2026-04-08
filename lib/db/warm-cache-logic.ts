/** Pure logic for client-side DB warm cooldown (used by warm-cache.ts). */

export function shouldWarmFromStamps(
  stamps: number[],
  now: number,
  cooldownMs: number,
): boolean {
  if (stamps.length === 0) return true;
  const newest = stamps[stamps.length - 1];
  return now - newest >= cooldownMs;
}

export function appendWarmStamp(
  stamps: number[],
  now: number,
  maxStamps: number,
): number[] {
  const next = [...stamps, now];
  while (next.length > maxStamps) next.shift();
  return next;
}
