import { FeatureIcon } from "@/components/landing/FeatureIcon";
import { landingFeatures } from "@/lib/landing-content";

const iconOrder = [
  "citations",
  "summary",
  "highlight",
  "followup",
  "search",
  "private",
] as const;

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-7xl py-2"
      aria-labelledby="landing-features-heading"
    >
      <div className="h-full w-full">
        <div className="space-y-14 py-14">
          <h2
            id="landing-features-heading"
            className="sr-only"
          >
            Features
          </h2>
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-9 pt-16 sm:grid-cols-2 sm:gap-y-20 lg:grid-cols-3">
            {landingFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground">
                  <FeatureIcon
                    variant={iconOrder[index] ?? "citations"}
                    className="h-5 w-5"
                  />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
