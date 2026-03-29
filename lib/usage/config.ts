function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function getInitialUserCredits(): number {
  return intEnv("USER_INITIAL_CREDITS", 2_000);
}

export function getCreditCostChat(): number {
  return intEnv("CREDIT_COST_CHAT", 12);
}

/** Per PDF page embedded during ingest (embedding API calls). */
export function getCreditCostEmbedPerPage(): number {
  return intEnv("CREDIT_COST_EMBED_PER_PAGE", 3);
}

export function getRateLimitChatPerMinute(): number {
  return intEnv("RATE_LIMIT_CHAT_PER_MINUTE", 24);
}

export function getRateLimitIngestPerHour(): number {
  return intEnv("RATE_LIMIT_INGEST_PER_HOUR", 8);
}
