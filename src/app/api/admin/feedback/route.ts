import { NextResponse } from "next/server";
import { FeedbackStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminErrorResponse, requireAdminOrModerator } from "@/lib/admin-authz";

const updateSchema = z.object({
  feedbackId: z.string().min(1),
  status: z.nativeEnum(FeedbackStatus),
});

export async function GET(request: Request) {
  try {
    await requireAdminOrModerator();
    const { searchParams } = new URL(request.url);
    const statusRaw = searchParams.get("status");
    const status =
      statusRaw && Object.values(FeedbackStatus).includes(statusRaw as FeedbackStatus)
        ? (statusRaw as FeedbackStatus)
        : undefined;

    const feedback = await db.feedback.findMany({
      where: status ? { status } : {},
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
      take: 200,
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrModerator();
    const payload = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await db.feedback.update({
      where: { id: parsed.data.feedbackId },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ feedback: updated });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}
