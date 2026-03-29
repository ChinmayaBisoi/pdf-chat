import { afterEach, describe, expect, it } from "vitest";
import {
  getCreditCostChat,
  getCreditCostEmbedPerPage,
  getInitialUserCredits,
  getRateLimitChatPerMinute,
  getRateLimitIngestPerHour,
} from "@/lib/usage/config";

function clearEnv(...keys: string[]) {
  for (const k of keys) {
    delete process.env[k];
  }
}

describe("usage config env parsing", () => {
  afterEach(() => {
    clearEnv(
      "USER_INITIAL_CREDITS",
      "CREDIT_COST_CHAT",
      "CREDIT_COST_EMBED_PER_PAGE",
      "RATE_LIMIT_CHAT_PER_MINUTE",
      "RATE_LIMIT_INGEST_PER_HOUR",
    );
  });

  it("uses defaults when vars are unset", () => {
    expect(getInitialUserCredits()).toBe(2_000);
    expect(getCreditCostChat()).toBe(12);
    expect(getCreditCostEmbedPerPage()).toBe(3);
    expect(getRateLimitChatPerMinute()).toBe(24);
    expect(getRateLimitIngestPerHour()).toBe(8);
  });

  it("parses positive integers from env", () => {
    process.env.USER_INITIAL_CREDITS = "100";
    process.env.CREDIT_COST_CHAT = "5";
    expect(getInitialUserCredits()).toBe(100);
    expect(getCreditCostChat()).toBe(5);
  });

  it("falls back when value is not a finite integer", () => {
    process.env.RATE_LIMIT_CHAT_PER_MINUTE = "x";
    expect(getRateLimitChatPerMinute()).toBe(24);
  });

  it("treats empty string as unset", () => {
    process.env.RATE_LIMIT_INGEST_PER_HOUR = "";
    expect(getRateLimitIngestPerHour()).toBe(8);
  });
});
