import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  getSql: vi.fn(),
}));

import { getSql } from "@/lib/db";
import { pingDatabase } from "./ping";

describe("pingDatabase", () => {
  beforeEach(() => {
    vi.mocked(getSql).mockReset();
  });

  it("returns ok with latency when SELECT 1 succeeds", async () => {
    vi.mocked(getSql).mockReturnValue(() => Promise.resolve([{ "?column?": 1 }]));
    const r = await pingDatabase();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(typeof r.latencyMs).toBe("number");
      expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    }
  });

  it("returns error when query throws", async () => {
    vi.mocked(getSql).mockReturnValue(() =>
      Promise.reject(new Error("connection refused")),
    );
    const r = await pingDatabase();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("connection refused");
  });

  it("stringifies non-Error throws", async () => {
    vi.mocked(getSql).mockReturnValue(() => Promise.reject("boom"));
    const r = await pingDatabase();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("boom");
  });
});
