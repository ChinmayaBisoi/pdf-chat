import { describe, expect, it } from "vitest";
import {
  COOLDOWN_MS,
  MAX_STAMPS,
  nextStampsAfterWarm,
  parseStampsFromStorage,
  shouldWarmFromStamps,
} from "./warm-cache";

describe("parseStampsFromStorage", () => {
  it("returns empty for null or empty", () => {
    expect(parseStampsFromStorage(null)).toEqual([]);
    expect(parseStampsFromStorage("")).toEqual([]);
  });

  it("filters to finite numbers, sorts, and keeps last MAX_STAMPS", () => {
    const many = JSON.stringify([1, 2, 3, 4, 5, 6, 7]);
    expect(parseStampsFromStorage(many)).toEqual([3, 4, 5, 6, 7]);
  });

  it("returns empty on invalid JSON or non-array", () => {
    expect(parseStampsFromStorage("not json")).toEqual([]);
    expect(parseStampsFromStorage(JSON.stringify({ a: 1 }))).toEqual([]);
  });
});

describe("shouldWarmFromStamps", () => {
  it("warms when no stamps", () => {
    expect(shouldWarmFromStamps([], 1_000_000)).toBe(true);
  });

  it("skips warm within cooldown of newest stamp", () => {
    const t = 1_000_000;
    expect(shouldWarmFromStamps([t - COOLDOWN_MS], t)).toBe(true);
    expect(shouldWarmFromStamps([t - COOLDOWN_MS + 1], t)).toBe(false);
  });
});

describe("nextStampsAfterWarm", () => {
  it("appends and trims to MAX_STAMPS", () => {
    const base = [1, 2, 3, 4, 5];
    expect(nextStampsAfterWarm(base, 6)).toEqual([2, 3, 4, 5, 6]);
    expect(nextStampsAfterWarm([], 99)).toEqual([99]);
    expect(nextStampsAfterWarm([], 99)).toHaveLength(1);
  });

  it("never exceeds MAX_STAMPS", () => {
    let s: number[] = [];
    for (let i = 0; i < MAX_STAMPS + 10; i++) {
      s = nextStampsAfterWarm(s, i);
    }
    expect(s).toHaveLength(MAX_STAMPS);
  });
});
