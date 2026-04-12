import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/auth-session";
import { createLocalFeedback } from "@/lib/feedback-store";

const createFeedbackSchema = z.object({
  name: z.string().trim().max(80).optional(),
  siteRating: z.number().int().min(1).max(5),
  performanceRating: z.number().int().min(1).max(5),
  whatToAdd: z.string().trim().min(8).max(1200),
  whatToImprove: z.string().trim().max(1200).optional(),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = createFeedbackSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid feedback payload.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const session = await getServerSessionUser();
  const useDatabase = Boolean(process.env.DATABASE_URL);
  /** Legacy DB column; form no longer collects a separate content score. */
  const contentRating = parsed.data.siteRating;

  if (!useDatabase) {
    const local = createLocalFeedback({
      userId: session?.userId ?? null,
      name: parsed.data.name || session?.username || null,
      siteRating: parsed.data.siteRating,
      contentRating,
      performanceRating: parsed.data.performanceRating,
      whatToAdd: parsed.data.whatToAdd,
      whatToImprove: parsed.data.whatToImprove || null,
    });
    return NextResponse.json({ feedbackId: local.id }, { status: 201 });
  }

  try {
    const feedback = await db.feedback.create({
      data: {
        userId: session?.userId ?? null,
        name: parsed.data.name || session?.username || null,
        siteRating: parsed.data.siteRating,
        contentRating,
        performanceRating: parsed.data.performanceRating,
        whatToAdd: parsed.data.whatToAdd,
        whatToImprove: parsed.data.whatToImprove || null,
      },
    });

    return NextResponse.json({ feedbackId: feedback.id }, { status: 201 });
  } catch {
    const local = createLocalFeedback({
      userId: session?.userId ?? null,
      name: parsed.data.name || session?.username || null,
      siteRating: parsed.data.siteRating,
      contentRating,
      performanceRating: parsed.data.performanceRating,
      whatToAdd: parsed.data.whatToAdd,
      whatToImprove: parsed.data.whatToImprove || null,
    });
    return NextResponse.json({ feedbackId: local.id }, { status: 201 });
  }
}
