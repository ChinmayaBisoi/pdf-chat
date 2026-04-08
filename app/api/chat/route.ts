import { auth } from "@clerk/nextjs/server";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import type { UIMessage } from "ai";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import {
  generateCitationsForAnswer,
  streamAnswerMarkdown,
} from "@/lib/ai/citation-chat";
import { getSql } from "@/lib/db";
import { insertChatMessage } from "@/lib/db/project-thread";
import type { Citation } from "@/lib/pdf/types";
import { dedupePages, retrieveChunksForQuery } from "@/lib/pdf/retrieve";
import { getCreditCostChat } from "@/lib/usage/config";
import { consumeCredits, getCreditsBalance, refundCredits } from "@/lib/usage/credits";
import {
  checkRateLimit,
  retryAfterSecondsForKind,
} from "@/lib/usage/rate-limit";
import { chatPostBodySchema } from "@/lib/validation/api-bodies";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = chatPostBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { documentId, message } = parsed.data;
  const sql = getSql();

  const [doc] = await sql`
    SELECT id, project_id FROM documents
    WHERE id = ${documentId}::uuid AND clerk_user_id = ${userId}
  `;

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const projectId = doc.project_id as string;

  const rl = await checkRateLimit(userId, "chat_minute");
  if (!rl.ok) {
    const res = NextResponse.json(
      {
        error: "Too many chat requests. Try again in a moment.",
        code: "RATE_LIMIT",
      },
      { status: 429 },
    );
    res.headers.set(
      "Retry-After",
      String(retryAfterSecondsForKind("chat_minute")),
    );
    return res;
  }

  const chatCost = getCreditCostChat();
  const spent = await consumeCredits(userId, chatCost);
  if (!spent.ok) {
    const creditsRemaining = await getCreditsBalance(userId);
    return NextResponse.json(
      {
        error: "Insufficient credits for this chat message.",
        code: "INSUFFICIENT_CREDITS",
        creditsRemaining,
      },
      { status: 403 },
    );
  }

  try {
    const chunks = await retrieveChunksForQuery({
      documentId,
      query: message,
      limit: 12,
    });

    if (chunks.length === 0) {
      await refundCredits(userId, chatCost);
      return NextResponse.json(
        { error: "No indexed content for this document. Try re-uploading." },
        { status: 422 },
      );
    }

    const deduped = dedupePages(chunks);
    const allowedPages = [...new Set(deduped.map((c) => c.page))];

    const userMessageId = nanoid();
    const userParts: UIMessage["parts"] = [{ type: "text", text: message }];
    await insertChatMessage({
      projectId,
      id: userMessageId,
      role: "user",
      parts: userParts,
    });

    const headers = new Headers();
    headers.set("X-Credits-Remaining", String(spent.balance));
    headers.set("X-Allowed-Pages", JSON.stringify(allowedPages));

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamAnswerMarkdown({
          userMessage: message,
          contextBlocks: deduped,
          allowedPages,
          onError: async () => {
            await refundCredits(userId, chatCost);
          },
        });

        writer.merge(result.toUIMessageStream());
        await result.consumeStream();
        const answerText = await result.text;

        let citationList: Citation[] = [];
        try {
          const citations = await generateCitationsForAnswer({
            userMessage: message,
            answerText,
            contextBlocks: deduped,
            allowedPages,
          });
          citationList = citations.citations;
          writer.write({
            type: "data-citations",
            id: "citations",
            data: citationList,
          });
        } catch (e) {
          console.error("citation generation failed", e);
          writer.write({
            type: "data-citations",
            id: "citations",
            data: [],
          });
        }

        const assistantParts: UIMessage["parts"] = [
          { type: "text", text: answerText, state: "done" },
          {
            type: "data-citations",
            id: "citations",
            data: citationList,
          },
        ];
        await insertChatMessage({
          projectId,
          id: nanoid(),
          role: "assistant",
          parts: assistantParts,
        });
      },
    });

    return createUIMessageStreamResponse({ stream, headers });
  } catch (e) {
    await refundCredits(userId, chatCost);
    console.error("chat failed", e);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
