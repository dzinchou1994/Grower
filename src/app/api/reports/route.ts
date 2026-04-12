import { NextResponse } from "next/server";
import { ReportTargetType } from "@prisma/client";
import { z } from "zod";
import { getServerSessionUser } from "@/lib/auth-session";
import { db } from "@/lib/db";

const createReportSchema = z.object({
  targetType: z.enum(["THREAD", "COMMENT", "NEWS_COMMENT", "CANNAPEDIA_COMMENT"]),
  targetId: z.string().min(1),
  reason: z.string().trim().min(3).max(500),
});

export async function POST(request: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Reporting is unavailable without database configuration." },
      { status: 503 },
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = createReportSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { targetType, targetId, reason } = parsed.data;

  if (targetType === "THREAD") {
    const thread = await db.forumThread.findUnique({
      where: { id: targetId },
      select: { id: true, authorId: true },
    });
    if (!thread) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    }
    if (thread.authorId === sessionUser.userId) {
      return NextResponse.json({ error: "You cannot report your own thread." }, { status: 400 });
    }

    const existing = await db.report.findFirst({
      where: {
        reporterId: sessionUser.userId,
        targetType: ReportTargetType.THREAD,
        targetId,
        status: "OPEN",
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, reportId: existing.id });
    }

    const report = await db.report.create({
      data: {
        reporterId: sessionUser.userId,
        targetType: ReportTargetType.THREAD,
        targetId,
        threadId: targetId,
        reason,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, reportId: report.id }, { status: 201 });
  }

  if (targetType === "NEWS_COMMENT") {
    return handleNewsCommentReport(sessionUser, targetId, reason);
  }

  if (targetType === "CANNAPEDIA_COMMENT") {
    return handleCannapediaCommentReport(sessionUser, targetId, reason);
  }

  const comment = await db.forumComment.findUnique({
    where: { id: targetId },
    select: { id: true, authorId: true },
  });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }
  if (comment.authorId === sessionUser.userId) {
    return NextResponse.json({ error: "You cannot report your own comment." }, { status: 400 });
  }

  const existing = await db.report.findFirst({
    where: {
      reporterId: sessionUser.userId,
      targetType: ReportTargetType.COMMENT,
      targetId,
      status: "OPEN",
    },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ ok: true, reportId: existing.id });
  }

  const report = await db.report.create({
    data: {
      reporterId: sessionUser.userId,
      targetType: ReportTargetType.COMMENT,
      targetId,
      commentId: targetId,
      reason,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, reportId: report.id }, { status: 201 });
}

async function handleNewsCommentReport(
  sessionUser: { userId: string },
  targetId: string,
  reason: string,
) {
  const row = await db.newsComment.findUnique({
    where: { id: targetId },
    select: { id: true, authorId: true },
  });
  if (!row) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }
  if (row.authorId === sessionUser.userId) {
    return NextResponse.json({ error: "You cannot report your own comment." }, { status: 400 });
  }

  const existing = await db.report.findFirst({
    where: {
      reporterId: sessionUser.userId,
      targetType: ReportTargetType.NEWS_COMMENT,
      targetId,
      status: "OPEN",
    },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ ok: true, reportId: existing.id });
  }

  const report = await db.report.create({
    data: {
      reporterId: sessionUser.userId,
      targetType: ReportTargetType.NEWS_COMMENT,
      targetId,
      newsCommentId: targetId,
      reason,
    },
    select: { id: true },
  });
  return NextResponse.json({ ok: true, reportId: report.id }, { status: 201 });
}

async function handleCannapediaCommentReport(
  sessionUser: { userId: string },
  targetId: string,
  reason: string,
) {
  const row = await db.cannapediaArticleComment.findUnique({
    where: { id: targetId },
    select: { id: true, authorId: true },
  });
  if (!row) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }
  if (row.authorId === sessionUser.userId) {
    return NextResponse.json({ error: "You cannot report your own comment." }, { status: 400 });
  }

  const existing = await db.report.findFirst({
    where: {
      reporterId: sessionUser.userId,
      targetType: ReportTargetType.CANNAPEDIA_COMMENT,
      targetId,
      status: "OPEN",
    },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ ok: true, reportId: existing.id });
  }

  const report = await db.report.create({
    data: {
      reporterId: sessionUser.userId,
      targetType: ReportTargetType.CANNAPEDIA_COMMENT,
      targetId,
      cannapediaArticleCommentId: targetId,
      reason,
    },
    select: { id: true },
  });
  return NextResponse.json({ ok: true, reportId: report.id }, { status: 201 });
}
