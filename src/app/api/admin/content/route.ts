import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import {
  AdminAuthError,
  adminErrorResponse,
  requireAdmin,
  requireAdminOrModerator,
} from "@/lib/admin-authz";
import { writeAuditLog } from "@/lib/audit-log";
import { db } from "@/lib/db";
import { canRunContentAction } from "@/lib/admin-policy";

const contentActionSchema = z.object({
  targetType: z.enum(["THREAD", "COMMENT", "DIARY", "DIARY_WEEK"]),
  targetId: z.string().min(1),
  action: z.enum(["HIDE", "UNHIDE", "LOCK", "UNLOCK", "PIN", "UNPIN", "DELETE"]),
  reason: z.string().min(2).max(500),
});

function requireActionPermission(action: string, role: "ADMIN" | "MODERATOR") {
  if (!canRunContentAction(role, action)) {
    throw new AdminAuthError(403, "Only ADMIN can permanently delete content.");
  }
}

function revalidateForumListCaches() {
  revalidateTag("forum-topics-ka", "max");
  revalidateTag("forum-topics-en", "max");
  revalidateTag("forum-topics-ru", "max");
}

export async function GET(request: Request) {
  try {
    await requireAdminOrModerator();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "threads";
    const q = searchParams.get("q")?.trim();
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
    const skip = (page - 1) * pageSize;

    if (type === "threads") {
      const where = q
        ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { body: { contains: q, mode: "insensitive" as const } }] }
        : {};
      const [total, items] = await Promise.all([
        db.forumThread.count({ where }),
        db.forumThread.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
          include: {
            author: { select: { id: true, username: true } },
            topic: { select: { id: true, title: true, slug: true } },
            _count: { select: { comments: true, likes: true } },
          },
        }),
      ]);
      return NextResponse.json({ type, page, pageSize, total, items });
    }

    if (type === "comments") {
      const where = q
        ? { body: { contains: q, mode: "insensitive" as const } }
        : {};
      const [total, items] = await Promise.all([
        db.forumComment.count({ where }),
        db.forumComment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
          include: {
            author: { select: { id: true, username: true } },
            thread: { select: { id: true, title: true, slug: true } },
            _count: { select: { likes: true } },
          },
        }),
      ]);
      return NextResponse.json({ type, page, pageSize, total, items });
    }

    const where = q
      ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] }
      : {};
    const [total, items] = await Promise.all([
      db.diary.count({ where }),
      db.diary.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          author: { select: { id: true, username: true } },
          _count: { select: { weeks: true } },
        },
      }),
    ]);
    return NextResponse.json({ type: "diaries", page, pageSize, total, items });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

export async function PATCH(request: Request) {
  try {
    let session = await requireAdminOrModerator();
    const payload = await request.json().catch(() => null);
    const parsed = contentActionSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    requireActionPermission(parsed.data.action, session.role as "ADMIN" | "MODERATOR");
    if (parsed.data.action === "DELETE") {
      session = await requireAdmin();
    }

    const { action, reason, targetId, targetType } = parsed.data;
    let before: unknown = null;
    let after: unknown = null;

    if (targetType === "THREAD") {
      before = await db.forumThread.findUnique({ where: { id: targetId } });
      if (!before) {
        return NextResponse.json({ error: "Thread not found." }, { status: 404 });
      }
      if (action === "HIDE" || action === "UNHIDE") {
        after = await db.forumThread.update({
          where: { id: targetId },
          data: { isHidden: action === "HIDE" },
        });
      } else if (action === "LOCK" || action === "UNLOCK") {
        after = await db.forumThread.update({
          where: { id: targetId },
          data: { isLocked: action === "LOCK" },
        });
      } else if (action === "PIN" || action === "UNPIN") {
        after = await db.forumThread.update({
          where: { id: targetId },
          data: { isPinned: action === "PIN" },
        });
      } else {
        await db.forumThread.delete({ where: { id: targetId } });
      }
      revalidateForumListCaches();
    } else if (targetType === "COMMENT") {
      before = await db.forumComment.findUnique({ where: { id: targetId } });
      if (!before) {
        return NextResponse.json({ error: "Comment not found." }, { status: 404 });
      }
      if (action === "HIDE" || action === "UNHIDE") {
        after = await db.forumComment.update({
          where: { id: targetId },
          data: { isHidden: action === "HIDE" },
        });
      } else if (action === "DELETE") {
        await db.forumComment.delete({ where: { id: targetId } });
      } else {
        return NextResponse.json({ error: "Unsupported action for comment." }, { status: 400 });
      }
      revalidateForumListCaches();
    } else if (targetType === "DIARY") {
      before = await db.diary.findUnique({ where: { id: targetId } });
      if (!before) {
        return NextResponse.json({ error: "Diary not found." }, { status: 404 });
      }
      if (action === "HIDE" || action === "UNHIDE") {
        after = await db.diary.update({
          where: { id: targetId },
          data: { isHidden: action === "HIDE" },
        });
      } else if (action === "DELETE") {
        await db.diary.delete({ where: { id: targetId } });
      } else {
        return NextResponse.json({ error: "Unsupported action for diary." }, { status: 400 });
      }
    } else {
      before = await db.diaryWeek.findUnique({ where: { id: targetId } });
      if (!before) {
        return NextResponse.json({ error: "Diary week not found." }, { status: 404 });
      }
      if (action === "HIDE" || action === "UNHIDE") {
        after = await db.diaryWeek.update({
          where: { id: targetId },
          data: { isHidden: action === "HIDE" },
        });
      } else if (action === "DELETE") {
        await db.diaryWeek.delete({ where: { id: targetId } });
      } else {
        return NextResponse.json({ error: "Unsupported action for diary week." }, { status: 400 });
      }
    }

    await writeAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action,
      targetType,
      targetId,
      reason,
      before,
      after: after ?? { deleted: true },
    });

    return NextResponse.json({ ok: true, action, targetType, targetId });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}
