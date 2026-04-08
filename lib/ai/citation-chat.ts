import { openai } from "@ai-sdk/openai";
import { generateObject, streamText, type StreamTextOnErrorCallback } from "ai";
import { z } from "zod";
import {
  formatAllowedPagesForPrompt,
  formatPdfContextForPrompt,
} from "@/lib/ai/citation-prompt";

const citationsSchema = z.object({
  citations: z.array(
    z.object({
      page: z.number().int().positive(),
      excerpt: z.string(),
    }),
  ),
});

/** Streams the assistant answer as markdown (readable token stream in the UI). */
export function streamAnswerMarkdown(params: {
  userMessage: string;
  contextBlocks: { page: number; text: string }[];
  allowedPages: number[];
  onError?: StreamTextOnErrorCallback;
}) {
  const context = formatPdfContextForPrompt(params.contextBlocks);

  const pagesList = formatAllowedPagesForPrompt(params.allowedPages);

  return streamText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content: `You answer questions using ONLY the provided PDF excerpts. If the answer is not in the excerpts, say you cannot find it in the document.

Rules:
- Every factual claim must be supported by the excerpts.
- Respond in clear Markdown (paragraphs, lists when helpful).
- Do NOT include JSON or citation metadata in your reply. Only the answer text.`,
      },
      {
        role: "user",
        content: `Context from the PDF:\n\n${context}\n\nQuestion: ${params.userMessage}\n\nValid page numbers for citations (for a follow-up step): ${pagesList}.`,
      },
    ],
    onError: params.onError,
  });
}

/** After the answer is streamed, produce structured citations in one small call. */
export async function generateCitationsForAnswer(params: {
  userMessage: string;
  answerText: string;
  contextBlocks: { page: number; text: string }[];
  allowedPages: number[];
}) {
  const context = formatPdfContextForPrompt(params.contextBlocks);

  const pagesList = formatAllowedPagesForPrompt(params.allowedPages);

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: citationsSchema,
    messages: [
      {
        role: "system",
        content: `You add citations for an answer already written. Use ONLY these page numbers: ${pagesList}. Each citation must include a short excerpt quote from that page, or "" if only the page number matters.`,
      },
      {
        role: "user",
        content: `Question: ${params.userMessage}\n\nDraft answer:\n${params.answerText}\n\nPDF excerpts:\n\n${context}\n\nReturn citations that support the draft answer.`,
      },
    ],
  });

  return object;
}
