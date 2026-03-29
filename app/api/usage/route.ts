import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getCreditCostChat,
  getCreditCostEmbedPerPage,
  getInitialUserCredits,
  getRateLimitChatPerMinute,
  getRateLimitIngestPerHour,
} from "@/lib/usage/config";
import { getCreditsBalance } from "@/lib/usage/credits";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const credits = await getCreditsBalance(userId);

  return NextResponse.json({
    credits,
    initialCredits: getInitialUserCredits(),
    costs: {
      chatMessage: getCreditCostChat(),
      embedPerPage: getCreditCostEmbedPerPage(),
    },
    limits: {
      chatRequestsPerMinute: getRateLimitChatPerMinute(),
      ingestRequestsPerHour: getRateLimitIngestPerHour(),
    },
  });
}
