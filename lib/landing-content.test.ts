import { describe, expect, it } from "vitest";
import {
  howItWorksSteps,
  landingFeatures,
  landingGithubSourceUrl,
  landingHero,
  trustBadges,
} from "@/lib/landing-content";

describe("landing-content", () => {
  it("hero has required copy keys", () => {
    expect(landingHero.title.length).toBeGreaterThan(0);
    expect(landingHero.primaryCta.length).toBeGreaterThan(0);
    expect(landingHero.description).toContain("PDF");
  });

  it("features list is non-empty and each has title + description", () => {
    expect(landingFeatures.length).toBeGreaterThanOrEqual(6);
    for (const f of landingFeatures) {
      expect(f.title.length).toBeGreaterThan(0);
      expect(f.description.length).toBeGreaterThan(0);
    }
  });

  it("how-it-works has three ordered steps", () => {
    expect(howItWorksSteps).toHaveLength(3);
    expect(howItWorksSteps.map((s) => s.step)).toEqual([1, 2, 3]);
  });

  it("trust badges are labeled", () => {
    expect(trustBadges.length).toBeGreaterThan(0);
    for (const b of trustBadges) {
      expect(b.label.length).toBeGreaterThan(0);
    }
  });

  it("github URL is https", () => {
    expect(landingGithubSourceUrl.startsWith("https://")).toBe(true);
  });
});
