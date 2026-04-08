import { NextResponse } from "next/server";
import { adminErrorResponse, requireAdmin } from "@/lib/admin-authz";
import { db } from "@/lib/db";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDailySeries(days: number, entries: Date[]) {
  const now = new Date();
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(dayKey(d), 0);
  }
  for (const entry of entries) {
    const key = dayKey(entry);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }));
}

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const days = Math.min(180, Math.max(7, Number(searchParams.get("days") ?? "30")));
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      usersTotal,
      threadsTotal,
      commentsTotal,
      diariesTotal,
      openReports,
      usersCreatedRange,
      threadsCreatedRange,
      commentsCreatedRange,
      reportsResolvedRange,
      activeThreads24h,
      activeComments24h,
      activeDiaries24h,
      activeThreads7d,
      activeComments7d,
      activeDiaries7d,
      activeThreads30d,
      activeComments30d,
      activeDiaries30d,
      topTopics,
    ] = await Promise.all([
      db.user.count(),
      db.forumThread.count(),
      db.forumComment.count(),
      db.diary.count(),
      db.report.count({ where: { status: "OPEN" } }),
      db.user.findMany({ where: { createdAt: { gte: fromDate } }, select: { createdAt: true } }),
      db.forumThread.findMany({
        where: { createdAt: { gte: fromDate } },
        select: { createdAt: true },
      }),
      db.forumComment.findMany({
        where: { createdAt: { gte: fromDate } },
        select: { createdAt: true },
      }),
      db.report.findMany({
        where: { status: { in: ["REVIEWED", "RESOLVED"] }, updatedAt: { gte: fromDate } },
        select: { createdAt: true, updatedAt: true },
      }),
      db.forumThread.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.forumComment.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.diary.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.forumThread.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.forumComment.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.diary.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.forumThread.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.forumComment.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.diary.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.forumTopic.findMany({
        include: {
          _count: {
            select: { threads: true },
          },
        },
        orderBy: { threads: { _count: "desc" } },
        take: 5,
      }),
    ]);

    const dau = new Set([
      ...activeThreads24h.map((row) => row.authorId),
      ...activeComments24h.map((row) => row.authorId),
      ...activeDiaries24h.map((row) => row.authorId),
    ]).size;
    const wau = new Set([
      ...activeThreads7d.map((row) => row.authorId),
      ...activeComments7d.map((row) => row.authorId),
      ...activeDiaries7d.map((row) => row.authorId),
    ]).size;
    const mau = new Set([
      ...activeThreads30d.map((row) => row.authorId),
      ...activeComments30d.map((row) => row.authorId),
      ...activeDiaries30d.map((row) => row.authorId),
    ]).size;

    const resolutionDurationsHours = reportsResolvedRange.map((report) =>
      (report.updatedAt.getTime() - report.createdAt.getTime()) / (1000 * 60 * 60),
    );
    const avgResolutionHours =
      resolutionDurationsHours.length > 0
        ? Number(
            (
              resolutionDurationsHours.reduce((sum, value) => sum + value, 0) /
              resolutionDurationsHours.length
            ).toFixed(2),
          )
        : 0;

    return NextResponse.json({
      totals: {
        users: usersTotal,
        threads: threadsTotal,
        comments: commentsTotal,
        diaries: diariesTotal,
        openReports,
      },
      activeUsers: { dau, wau, mau },
      contentSeries: {
        users: buildDailySeries(days, usersCreatedRange.map((row) => row.createdAt)),
        threads: buildDailySeries(days, threadsCreatedRange.map((row) => row.createdAt)),
        comments: buildDailySeries(days, commentsCreatedRange.map((row) => row.createdAt)),
      },
      moderation: {
        resolvedReports: reportsResolvedRange.length,
        avgResolutionHours,
      },
      topTopics: topTopics.map((topic) => ({
        id: topic.id,
        slug: topic.slug,
        title: topic.title,
        threads: topic._count.threads,
      })),
    });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}
