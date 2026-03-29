export interface LandingFeature {
  title: string;
  description: string;
}

export const landingHero = {
  title: "Chat with PDF",
  description:
    "Upload any PDF, ask a question, and get concise, citation-linked answers, summaries, and follow-ups in seconds. Free tier, encrypted in transit, no training on your files.",
  primaryCta: "Upload a PDF",
  secondaryCta: "See how it works",
} as const;

export const landingFeatures: LandingFeature[] = [
  {
    title: "Citation backed answers",
    description:
      "Get answers backed by citations from specific sections of the PDF.",
  },
  {
    title: "Paper summary",
    description:
      "Get a detailed section-wise summary for your PDF file.",
  },
  {
    title: "Highlighted text explanations",
    description:
      "Understand complex passages with explanations tied to what you select.",
  },
  {
    title: "Follow-up questions",
    description:
      "Dig deeper with context-aware follow-ups that stay anchored to the document.",
  },
  {
    title: "Fast search across pages",
    description:
      "Jump to relevant pages and snippets without rereading the whole file.",
  },
  {
    title: "Private by design",
    description:
      "Your uploads stay yours. No model training on your documents.",
  },
];
