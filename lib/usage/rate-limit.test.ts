import { afterEach, describe, expect, it, vi } from "vitest";
import { retryAfterSecondsForKind } from "@/lib/usage/rate-limit";

describe("retryAfterSecondsForKind", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** Aligned so `Date.now() % 60_000 === 0`. */
  const minuteBoundary = 1_699_999_980_000;
  /** Aligned so `Date.now() % 3_600_000 === 0`. */
  const hourBoundary = 1_699_999_200_000;

  it("returns seconds until next minute window for chat_minute", () => {
    vi.spyOn(Date, "now").mockReturnValue(minuteBoundary);
    expect(retryAfterSecondsForKind("chat_minute")).toBe(60);
  });

  it("returns remaining seconds mid-minute for chat_minute", () => {
    vi.spyOn(Date, "now").mockReturnValue(minuteBoundary + 15_000);
    expect(retryAfterSecondsForKind("chat_minute")).toBe(45);
  });

  it("returns seconds until next hour for ingest_hour", () => {
    vi.spyOn(Date, "now").mockReturnValue(hourBoundary);
    expect(retryAfterSecondsForKind("ingest_hour")).toBe(3_600);
  });

  it("returns at least 1 second", () => {
    vi.spyOn(Date, "now").mockReturnValue(minuteBoundary + 59_999);
    expect(retryAfterSecondsForKind("chat_minute")).toBe(1);
  });
});
