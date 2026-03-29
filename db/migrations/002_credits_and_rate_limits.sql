-- Credits per Clerk user (abuse prevention)
CREATE TABLE IF NOT EXISTS user_credits (
  clerk_user_id TEXT PRIMARY KEY,
  balance INTEGER NOT NULL CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fixed-window rate limits (Postgres-backed, works on serverless)
CREATE TABLE IF NOT EXISTS rate_limit_windows (
  clerk_user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  window_id TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (clerk_user_id, kind, window_id)
);

CREATE INDEX IF NOT EXISTS rate_limit_windows_cleanup_idx
  ON rate_limit_windows (window_id);
