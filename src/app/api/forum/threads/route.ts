import { createForumThread } from "@/lib/forum-data";
import { getServerSessionUser } from "@/lib/auth-session";
import { NextResponse } from "next/server";
import { z } from "zod";

const createThreadSchema = z.object({
  topicSlug: z.string().min(2),
  title: z.string().min(6).max(140),
  body: z.string().min(10).max(5000),
});

export async function POST(request: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = createThreadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const thread = await createForumThread({
    ...parsed.data,
    author: sessionUser.username,
  });

  if (!thread) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  return NextResponse.json({ thread }, { status: 201 });
}
