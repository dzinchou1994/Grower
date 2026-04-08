import { listForumTopics } from "@/lib/forum-data";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const topics = await listForumTopics(query);
  return NextResponse.json({ topics });
}
