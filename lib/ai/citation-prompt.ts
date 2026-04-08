/** Pure helpers for building chat/citation prompts from PDF chunks. */

export function formatPdfContextForPrompt(
  contextBlocks: { page: number; text: string }[],
): string {
  return contextBlocks
    .map((b) => `--- Page ${b.page} ---\n${b.text}`)
    .join("\n\n");
}

/** Sorted ascending, comma-separated page list for model instructions. */
export function formatAllowedPagesForPrompt(allowedPages: number[]): string {
  return [...allowedPages].sort((a, b) => a - b).join(", ");
}
