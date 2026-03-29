import { describe, expect, it } from "vitest";
import { InsufficientCreditsError } from "@/lib/usage/errors";

describe("InsufficientCreditsError", () => {
  it("has expected name and message", () => {
    const e = new InsufficientCreditsError();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe("InsufficientCreditsError");
    expect(e.message).toContain("Insufficient credits");
  });
});
