import { createForumThread } from "@/lib/forum-data";
import { NextResponse } from "next/server";
import { z } from "zod";

const createThreadSchema = z.object({
  topicSlug: z.string().min(2),
  title: z.string().min(6).max(140),
  body: z.string().min(10).max(5000),
  author: z.string().min(2).max(40),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = createThreadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const thread = createForumThread(parsed.data);

  if (!thread) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  return NextResponse.json({ thread }, { status: 201 });
}
