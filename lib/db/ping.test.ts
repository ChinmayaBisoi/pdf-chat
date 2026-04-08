import { afterEach, describe, expect, it, vi } from "vitest";

const { mockSql } = vi.hoisted(() => ({ mockSql: vi.fn() }));

vi.mock("@/lib/db", () => ({
  getSql: () => mockSql,
}));

import { pingDatabase } from "@/lib/db/ping";

describe("pingDatabase", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok with latency when SELECT succeeds", async () => {
    mockSql.mockResolvedValueOnce([]);
    const result = await pingDatabase();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    }
    expect(mockSql).toHaveBeenCalled();
  });

  it("returns error string when query throws", async () => {
    mockSql.mockRejectedValueOnce(new Error("connection refused"));
    const result = await pingDatabase();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("connection refused");
    }
  });

  it("stringifies non-Error throws", async () => {
    mockSql.mockRejectedValueOnce("boom");
    const result = await pingDatabase();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("boom");
  });
});
