import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser } from "@/lib/auth-session";
import { createDiaryWeekComment } from "@/lib/diary-data";

const bodySchema = z.object({
  body: z.string().trim().min(1).max(10000),
});

function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Invalid request.";
}

type RouteContext = { params: Promise<{ slug: string; weekNumber: string }> };

export async function POST(request: Request, context: RouteContext) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { slug, weekNumber: weekParam } = await context.params;
  const weekNumber = Number(weekParam);
  if (!Number.isInteger(weekNumber) || weekNumber < 1) {
    return NextResponse.json({ error: "Invalid week number." }, { status: 400 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  try {
    const comment = await createDiaryWeekComment({
      diarySlug: slug,
      weekNumber,
      authorId: sessionUser.userId,
      body: parsed.data.body,
    });

    if (!comment) {
      return NextResponse.json({ error: "Diary or week not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
        author: comment.author,
      },
      { status: 201 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to post comment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
