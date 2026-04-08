import { afterEach, describe, expect, it } from "vitest";
import { getSql } from "@/lib/db";

describe("getSql", () => {
  const saved = process.env.DATABASE_URL;

  afterEach(() => {
    if (saved === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = saved;
  });

  it("throws a clear error when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    expect(() => getSql()).toThrow(/DATABASE_URL/);
  });

  it("returns a tagged-template function when DATABASE_URL is set", () => {
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/db";
    const sql = getSql();
    expect(typeof sql).toBe("function");
  });
});
