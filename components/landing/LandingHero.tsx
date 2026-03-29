import Link from "next/link";

import { landingHero } from "@/lib/landing-content";

export function LandingHero() {
  return (
    <section
      id="upload"
      className="mx-auto w-full max-w-[635px] space-y-10 px-4 pb-14 max-sm:px-4 lg:pb-20 lg:pt-10"
      aria-labelledby="landing-hero-heading"
    >
      <div className="space-y-4 text-center">
        <h1
          id="landing-hero-heading"
          className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
        >
          {landingHero.title}
        </h1>
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
          {landingHero.description}
        </p>
      </div>
      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="#upload"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {landingHero.primaryCta}
        </Link>
        <Link
          href="#features"
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-8 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {landingHero.secondaryCta}
        </Link>
      </div>
    </section>
  );
}
