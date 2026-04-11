import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser } from "@/lib/auth-session";
import { updateDiaryWeek } from "@/lib/diary-data";

const patchWeekSchema = z.object({
  title: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().min(1).max(20000).optional(),
  /** When sent, must include at least one image URL (replace entire gallery). */
  imageUrls: z.array(z.string().trim().url().max(500)).min(1).max(24).optional(),
});

function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Invalid request.";
}

type RouteContext = { params: Promise<{ slug: string; weekNumber: string }> };

export async function PATCH(request: Request, context: RouteContext) {
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
  const parsed = patchWeekSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  try {
    const result = await updateDiaryWeek({
      diarySlug: slug,
      authorId: sessionUser.userId,
      weekNumber,
      title: parsed.data.title,
      description: parsed.data.description,
      imageUrls: parsed.data.imageUrls,
    });

    if (!result) {
      return NextResponse.json({ error: "Diary or week not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update week.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
