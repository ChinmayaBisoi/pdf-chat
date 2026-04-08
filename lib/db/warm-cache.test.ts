import { describe, expect, it } from "vitest";
import {
  COOLDOWN_MS,
  MAX_STAMPS,
  nextStampsAfterWarm,
  parseStampsFromStorage,
  shouldWarmFromStamps,
} from "@/lib/db/warm-cache";

describe("parseStampsFromStorage", () => {
  it("returns empty for null", () => {
    expect(parseStampsFromStorage(null)).toEqual([]);
  });

  it("parses valid JSON array of numbers", () => {
    expect(parseStampsFromStorage("[1, 2, 3]")).toEqual([1, 2, 3]);
  });

  it("filters non-numbers and sorts", () => {
    expect(parseStampsFromStorage("[3, null, 1, \"x\"]")).toEqual([1, 3]);
  });

  it("keeps only last MAX_STAMPS entries when sorted", () => {
    const many = JSON.stringify([1, 2, 3, 4, 5, 6, 7]);
    const out = parseStampsFromStorage(many);
    expect(out.length).toBeLessThanOrEqual(MAX_STAMPS);
    expect(out).toEqual([3, 4, 5, 6, 7]);
  });

  it("returns empty on invalid JSON", () => {
    expect(parseStampsFromStorage("{")).toEqual([]);
  });
});

describe("shouldWarmFromStamps", () => {
  it("returns true when no stamps", () => {
    expect(shouldWarmFromStamps([], 1_000)).toBe(true);
  });

  it("returns false when newest stamp is within cooldown", () => {
    const now = 1_000_000;
    expect(shouldWarmFromStamps([now - 1000], now)).toBe(false);
  });

  it("returns true when newest stamp is older than cooldown", () => {
    const now = 1_000_000;
    expect(shouldWarmFromStamps([now - COOLDOWN_MS - 1], now)).toBe(true);
  });
});

describe("nextStampsAfterWarm", () => {
  it("appends now and trims to MAX_STAMPS", () => {
    const base = [1, 2, 3, 4, 5];
    const next = nextStampsAfterWarm(base, 99);
    expect(next[next.length - 1]).toBe(99);
    expect(next.length).toBe(MAX_STAMPS);
    expect(next).toEqual([2, 3, 4, 5, 99]);
  });
});
