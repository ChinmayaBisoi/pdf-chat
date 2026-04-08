const STORAGE_KEY = "pdf-chats-db-warm-stamps";
export const MAX_STAMPS = 5;
/** Skip warm if we pinged within this window (Neon stays warm a few minutes). */
export const COOLDOWN_MS = 5 * 60 * 1000;

/** Parse stored JSON into sorted, bounded stamp list (for tests + browser). */
export function parseStampsFromStorage(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is number => typeof x === "number" && Number.isFinite(x))
      .sort((a, b) => a - b)
      .slice(-MAX_STAMPS);
  } catch {
    return [];
  }
}

export function shouldWarmFromStamps(stamps: number[], now: number): boolean {
  if (stamps.length === 0) return true;
  const newest = stamps[stamps.length - 1];
  return now - newest >= COOLDOWN_MS;
}

export function nextStampsAfterWarm(stamps: number[], now: number): number[] {
  const next = [...stamps, now];
  while (next.length > MAX_STAMPS) next.shift();
  return next;
}

function readStamps(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return parseStampsFromStorage(raw);
  } catch {
    return [];
  }
}

function writeStamps(stamps: number[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stamps));
}

/**
 * Whether we should call the health endpoint as a warm ping (vs status-only poll).
 * Uses the newest stored timestamp: skip if within cooldown.
 * Keeps at most 5 timestamps (rolling) after each successful warm.
 */
export function shouldWarmDatabase(): boolean {
  return shouldWarmFromStamps(readStamps(), Date.now());
}

/** Call after a successful warm ping so cooldown and history stay accurate. */
export function recordWarmTimestamp(): void {
  writeStamps(nextStampsAfterWarm(readStamps(), Date.now()));
}
