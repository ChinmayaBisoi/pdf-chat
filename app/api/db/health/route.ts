import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db/ping";

export async function GET() {
  const result = await pingDatabase();
  if (!result.ok) {
    return NextResponse.json(result, { status: 503 });
  }
  return NextResponse.json(result);
}
