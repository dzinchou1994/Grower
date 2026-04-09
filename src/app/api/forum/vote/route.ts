import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/auth-session";
import { NextResponse } from "next/server";
import { z } from "zod";

const voteSchema = z.object({
  threadId: z.string().optional(),
  commentId: z.string().optional(),
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
}).refine(
  (data) => Boolean(data.threadId) !== Boolean(data.commentId),
  "Exactly one of threadId or commentId must be provided",
);

export async function POST(request: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors.join(", ") || "Invalid input." }, { status: 400 });
  }

  const { threadId, commentId, value } = parsed.data;
  const userId = sessionUser.userId;

  if (value === 0) {
    if (threadId) {
      await db.vote.deleteMany({ where: { userId, threadId } });
    } else if (commentId) {
      await db.vote.deleteMany({ where: { userId, commentId } });
    }
    return NextResponse.json({ ok: true, value: 0 });
  }

  if (threadId) {
    await db.vote.upsert({
      where: { userId_threadId: { userId, threadId } },
      update: { value },
      create: { userId, threadId, value },
    });
  } else if (commentId) {
    await db.vote.upsert({
      where: { userId_commentId: { userId, commentId } },
      update: { value },
      create: { userId, commentId, value },
    });
  }

  return NextResponse.json({ ok: true, value });
}
