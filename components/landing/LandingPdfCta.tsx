"use client";

import { SignUpButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Size = "default" | "lg" | "sm";

export function LandingPdfCta({
  size = "lg",
  className,
  label,
}: {
  size?: Size;
  className?: string;
  label: string;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const btnSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "default";

  if (!isLoaded) {
    return (
      <Button size={btnSize} disabled className={cn("gap-2", className)}>
        <Upload className="size-4 shrink-0" />
        {label}
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignUpButton mode="modal" forceRedirectUrl="/chat">
        <Button size={btnSize} className={cn("gap-2", className)}>
          <Upload className="size-4 shrink-0" />
          {label}
        </Button>
      </SignUpButton>
    );
  }

  return (
    <Button size={btnSize} className={cn("gap-2", className)} asChild>
      <Link href="/chat">
        <Upload className="size-4 shrink-0" />
        {label}
      </Link>
    </Button>
  );
}
