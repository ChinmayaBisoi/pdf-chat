const STORAGE_KEY = "pdf-chats-db-warm-stamps";
const MAX_STAMPS = 5;
/** Skip warm if we pinged within this window (Neon stays warm a few minutes). */
const COOLDOWN_MS = 5 * 60 * 1000;

function readStamps(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
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
  const stamps = readStamps();
  if (stamps.length === 0) return true;
  const newest = stamps[stamps.length - 1];
  return Date.now() - newest >= COOLDOWN_MS;
}

/** Call after a successful warm ping so cooldown and history stay accurate. */
export function recordWarmTimestamp(): void {
  const stamps = readStamps();
  stamps.push(Date.now());
  while (stamps.length > MAX_STAMPS) stamps.shift();
  writeStamps(stamps);
}
