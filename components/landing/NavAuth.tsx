"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NavAuth() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex h-9 w-32 animate-pulse items-center justify-end rounded-md bg-muted" />
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <SignInButton mode="modal" forceRedirectUrl="/chat">
          <Button variant="ghost" size="sm">
            Log in
          </Button>
        </SignInButton>
        <SignUpButton mode="modal" forceRedirectUrl="/chat">
          <Button size="sm">Get started</Button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/chat">Chat</Link>
      </Button>
      <UserButton />
    </div>
  );
}
