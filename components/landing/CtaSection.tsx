import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingPdfCta } from "@/components/landing/LandingPdfCta";

export function CtaSection() {
  return (
    <section className="w-full border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-28">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to chat with your PDFs?
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Upload your first document and get answers in seconds.
            No credit card required.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LandingPdfCta size="lg" label="Upload a PDF" />
          <Button variant="outline" size="lg" className="gap-2 px-6 text-base" asChild>
            <Link href="/#features">
              Learn more
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
