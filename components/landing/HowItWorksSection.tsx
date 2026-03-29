import { howItWorksSteps } from "@/lib/landing-content";

export function HowItWorksSection() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <p className="text-muted-foreground">
            From upload to answers in under 30 seconds.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {howItWorksSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="flex flex-col items-center text-center gap-4">
                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Icon className="size-6" />
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                    {step.step}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
