import { Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <Button size="lg" className="gap-2 px-6 text-base">
            <Upload className="size-4" />
            Upload a PDF
          </Button>
          <Button variant="outline" size="lg" className="gap-2 px-6 text-base">
            Learn more
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
