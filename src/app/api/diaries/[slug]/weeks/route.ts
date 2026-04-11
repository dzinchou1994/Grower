import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser } from "@/lib/auth-session";
import { createDiaryWeek, getSuggestedNextWeekNumber } from "@/lib/diary-data";

const createWeekSchema = z.object({
  weekNumber: z.coerce.number().int().min(1).max(520),
  title: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().min(1).max(20000),
  imageUrls: z.array(z.string().trim().url().max(500)).min(1).max(24),
});

function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Invalid request.";
}

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { slug } = await context.params;
  const next = await getSuggestedNextWeekNumber(slug, sessionUser.userId);
  if (next === null) {
    return NextResponse.json({ error: "Diary not found." }, { status: 404 });
  }

  return NextResponse.json({ suggestedWeekNumber: next });
}

export async function POST(request: Request, context: RouteContext) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { slug } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = createWeekSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  try {
    const week = await createDiaryWeek({
      diarySlug: slug,
      authorId: sessionUser.userId,
      weekNumber: parsed.data.weekNumber,
      title: parsed.data.title,
      description: parsed.data.description,
      imageUrls: parsed.data.imageUrls,
    });

    if (!week) {
      return NextResponse.json({ error: "Diary not found." }, { status: 404 });
    }

    return NextResponse.json(
      { id: week.id, weekNumber: week.weekNumber, diarySlug: slug },
      { status: 201 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create week.";
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "That week number already exists for this diary." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
