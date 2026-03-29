import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const citationSchema = z.object({
  answer: z.string(),
  citations: z.array(
    z.object({
      page: z.number().int().positive(),
      // OpenAI json_schema requires every property key in `required`; use "" when no quote.
      excerpt: z.string(),
    }),
  ),
});

export type CitationResult = z.infer<typeof citationSchema>;

export async function generateCitationAnswer(params: {
  userMessage: string;
  contextBlocks: { page: number; text: string }[];
  allowedPages: number[];
}): Promise<CitationResult> {
  const context = params.contextBlocks
    .map((b) => `--- Page ${b.page} ---\n${b.text}`)
    .join("\n\n");

  const pagesList = params.allowedPages.sort((a, b) => a - b).join(", ");

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: citationSchema,
    messages: [
      {
        role: "system",
        content: `You answer questions using ONLY the provided PDF excerpts. If the answer is not in the excerpts, say you cannot find it in the document.

Rules:
- Every factual claim must be supported by the excerpts.
- citations[].page MUST be one of these page numbers: ${pagesList}. Do not cite any other page.
- For each citation, set excerpt to a short quote from that page, or "" if you only need the page number.`,
      },
      {
        role: "user",
        content: `Context from the PDF:\n\n${context}\n\nQuestion: ${params.userMessage}`,
      },
    ],
  });

  return object;
}
