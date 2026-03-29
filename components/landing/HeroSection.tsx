import { ArrowRight, Zap, Lock, Shield, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingPdfCta } from "@/components/landing/LandingPdfCta";
import { landingHero, trustBadges } from "@/lib/landing-content";

const trustIcons = {
  zap: Zap,
  lock: Lock,
  shield: Shield,
  globe: Globe,
} as const;

export function HeroSection() {
  return (
    <section className="relative mx-auto w-full max-w-3xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pt-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[480px] w-[640px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="flex flex-col items-center gap-6 text-center">
        <Badge
          variant="secondary"
          className="gap-1.5 px-3 py-1 text-xs font-medium"
        >
          <Zap className="size-3" />
          AI-powered PDF analysis
        </Badge>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {landingHero.title}
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {landingHero.description}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
          <LandingPdfCta size="lg" label={landingHero.primaryCta} />
          <Button variant="outline" size="lg" className="gap-2 px-6 text-base" asChild>
            <Link href="/#features">
              {landingHero.secondaryCta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4">
          {trustBadges.map((badge) => {
            const Icon = trustIcons[badge.icon];
            return (
              <span
                key={badge.label}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Icon className="size-3.5" />
                {badge.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
