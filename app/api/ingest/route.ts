import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { InvalidIngestUrlError } from "@/lib/ingest-file-url";
import {
  ingestPdfFromUrl,
  NoExtractableTextError,
  PdfFetchError,
  PdfPageLimitError,
} from "@/lib/pdf/ingest";
import { getCreditsBalance } from "@/lib/usage/credits";
import { InsufficientCreditsError } from "@/lib/usage/errors";
import {
  checkRateLimit,
  retryAfterSecondsForKind,
} from "@/lib/usage/rate-limit";
import { ingestPostBodySchema } from "@/lib/validation/api-bodies";

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

  const parsed = ingestPostBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const rl = await checkRateLimit(userId, "ingest_hour");
  if (!rl.ok) {
    const res = NextResponse.json(
      {
        error: "Too many PDF uploads. Try again later.",
        code: "RATE_LIMIT",
      },
      { status: 429 },
    );
    res.headers.set(
      "Retry-After",
      String(retryAfterSecondsForKind("ingest_hour")),
    );
    return res;
  }

  try {
    const { documentId } = await ingestPdfFromUrl({
      clerkUserId: userId,
      fileUrl: parsed.data.fileUrl,
      uploadThingKey: parsed.data.uploadThingKey,
    });
    return NextResponse.json({ documentId });
  } catch (e) {
    if (e instanceof InsufficientCreditsError) {
      const creditsRemaining = await getCreditsBalance(userId);
      return NextResponse.json(
        {
          error: e.message,
          code: "INSUFFICIENT_CREDITS",
          creditsRemaining,
        },
        { status: 403 },
      );
    }
    if (e instanceof InvalidIngestUrlError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    if (e instanceof PdfPageLimitError) {
      return NextResponse.json({ error: e.message }, { status: 413 });
    }
    if (e instanceof NoExtractableTextError) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    if (e instanceof PdfFetchError) {
      return NextResponse.json({ error: e.message }, { status: 502 });
    }
    console.error("ingest failed", e);
    return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
  }
}
