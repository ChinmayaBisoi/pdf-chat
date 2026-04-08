import { FileText } from "lucide-react";
import Link from "next/link";
import { DbStatusIndicator } from "@/components/db/DbStatusIndicator";
import { NavAuth } from "@/components/landing/NavAuth";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="size-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight">
            Pdf Chats
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <DbStatusIndicator />
          <Link
            href="/chats"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            All Chats
          </Link>
          <NavAuth />
        </div>
      </nav>
    </header>
  );
}
