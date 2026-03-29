import type { ReactNode } from "react";

interface FeatureIconProps {
  variant:
  | "citations"
  | "summary"
  | "highlight"
  | "followup"
  | "search"
  | "private";
  className?: string;
}

const iconPaths: Record<FeatureIconProps["variant"], ReactNode> = {
  citations: (
    <>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h4" />
    </>
  ),
  summary: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
      <path d="M4 9h16" />
      <path d="M4 15h12" />
    </>
  ),
  highlight: (
    <>
      <path d="m9 11-3 3a2.5 2.5 0 0 0 0 3.5l.5.5a2.5 2.5 0 0 0 3.5 0l3-3" />
      <path d="M15 7l3 3" />
      <path d="m2 22 5-5" />
      <path d="M14.5 4.5 18 8" />
    </>
  ),
  followup: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M13 8H7" />
      <path d="M17 12H7" />
    </>
  ),
  search: (
    <>
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </>
  ),
  private: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
};

export function FeatureIcon({ variant, className }: FeatureIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {iconPaths[variant]}
    </svg>
  );
}
