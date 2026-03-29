import type { LucideIcon } from "lucide-react";
import {
  Quote,
  FileText,
  Highlighter,
  MessagesSquare,
  Search,
  ShieldCheck,
  Upload,
  MessageCircle,
  BookOpen,
} from "lucide-react";

export interface LandingFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const landingGithubSourceUrl = "https://github.com/ChinmayaBisoi/pdf-chat";

export const landingHero = {
  title: "Your PDFs, answered.",
  subtitle: "Pdf Chats",
  description:
    "Upload any PDF and get instant, citation-linked answers, section-by-section summaries, and context-aware follow-ups. No sign-up required to start.",
  primaryCta: "Upload a PDF",
  secondaryCta: "See how it works",
} as const;

export const landingFeatures: LandingFeature[] = [
  {
    title: "Citation-backed answers",
    description:
      "Every answer links back to the exact paragraph and page, so you can verify in seconds.",
    icon: Quote,
  },
  {
    title: "Paper summaries",
    description:
      "Get section-by-section breakdowns of any paper, report, or contract instantly.",
    icon: FileText,
  },
  {
    title: "Highlighted text explanations",
    description:
      "Select any passage and get a plain-language explanation tied to what you highlighted.",
    icon: Highlighter,
  },
  {
    title: "Follow-up questions",
    description:
      "Dig deeper with context-aware follow-ups that stay anchored to the document.",
    icon: MessagesSquare,
  },
  {
    title: "Fast search across pages",
    description:
      "Jump to the exact page and snippet without scrolling through the entire file.",
    icon: Search,
  },
  {
    title: "Private by design",
    description:
      "Your uploads stay yours. Files are encrypted in transit and never used for training.",
    icon: ShieldCheck,
  },
];

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: 1,
    title: "Upload your PDF",
    description: "Drag and drop or browse to upload any PDF up to 50 MB.",
    icon: Upload,
  },
  {
    step: 2,
    title: "Ask a question",
    description:
      "Type your question in plain language. Pdf Chats finds the answer instantly.",
    icon: MessageCircle,
  },
  {
    step: 3,
    title: "Get cited answers",
    description:
      "Receive answers with direct citations and page references you can click to verify.",
    icon: BookOpen,
  },
];

export const trustBadges = [
  { label: "Free tier available", icon: "zap" },
  { label: "256-bit encrypted", icon: "lock" },
  { label: "No data training", icon: "shield" },
  { label: "75+ languages", icon: "globe" },
] as const;
