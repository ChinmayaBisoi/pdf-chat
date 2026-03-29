import { FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { landingGithubSourceUrl } from "@/lib/landing-content";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary">
              <FileText className="size-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Pdf Chats</span>
          </a>

          <nav>
            <a
              href={landingGithubSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <svg
                className="size-4 shrink-0"
                viewBox="0 0 98 96"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.32-22.213-5.529-22.213-24.469 0-5.704 1.981-10.357 5.519-13.941-.493-1.282-2.466-6.432.558-13.011 0 0 4.481-1.309 14.667 5.322 4.271-1.202 8.85-1.822 13.397-1.822s9.126.62 13.397 1.822c10.182-6.631 14.658-5.322 14.658-5.322 3.03 6.579.978 11.729.485 13.011 3.544 3.584 5.514 8.237 5.514 13.941 0 18.968-11.385 23.142-22.283 24.368 1.782 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.281.89 2.769 3.316 2.316 19.412-6.518 33.405-24.934 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                />
              </svg>
              Source code
            </a>
          </nav>
        </div>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Pdf Chats. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
