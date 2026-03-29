import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHero } from "@/components/landing/LandingHero";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <div className="flex min-h-dvh w-full flex-col sm:p-2 sm:pl-0">
        <div className="flex min-h-dvh w-full flex-col overflow-y-auto rounded-b-2xl bg-card shadow-sm">
          <main className="flex w-full flex-col items-center justify-center">
            <LandingHero />
            <LandingFeatures />
          </main>
        </div>
      </div>
    </div>
  );
}
