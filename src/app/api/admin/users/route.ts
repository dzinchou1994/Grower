import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { adminErrorResponse, requireAdmin } from "@/lib/admin-authz";
import { writeAuditLog } from "@/lib/audit-log";
import { db } from "@/lib/db";

const updateUserSchema = z
  .object({
    userId: z.string().min(1),
    role: z.nativeEnum(UserRole).optional(),
    suspend: z.boolean().optional(),
    suspensionDays: z.number().int().min(1).max(3650).optional(),
    suspensionReason: z.string().max(500).optional(),
    reason: z.string().max(500).optional(),
  })
  .refine((value) => value.role || typeof value.suspend === "boolean", {
    message: "At least one change is required.",
  });

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
    const skip = (page - 1) * pageSize;

    const where = q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isSuspended: true,
          suspendedUntil: true,
          suspensionReason: true,
          createdAt: true,
          _count: {
            select: {
              forumThreads: true,
              forumComments: true,
              diaries: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({ page, pageSize, total, users });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdmin();
    const payload = await request.json().catch(() => null);
    const parsed = updateUserSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await db.user.findUnique({ where: { id: parsed.data.userId } });
    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updateData: {
      role?: UserRole;
      isSuspended?: boolean;
      suspendedUntil?: Date | null;
      suspensionReason?: string | null;
    } = {};

    let auditAction: "ROLE_CHANGE" | "SUSPEND" | "UNSUSPEND" = "ROLE_CHANGE";

    if (parsed.data.role && parsed.data.role !== existing.role) {
      updateData.role = parsed.data.role;
      auditAction = "ROLE_CHANGE";
    }

    if (typeof parsed.data.suspend === "boolean") {
      if (parsed.data.suspend) {
        const days = parsed.data.suspensionDays ?? 30;
        const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        updateData.isSuspended = true;
        updateData.suspendedUntil = until;
        updateData.suspensionReason = parsed.data.suspensionReason ?? null;
        auditAction = "SUSPEND";
      } else {
        updateData.isSuspended = false;
        updateData.suspendedUntil = null;
        updateData.suspensionReason = null;
        auditAction = "UNSUSPEND";
      }
    }

    const updated = await db.user.update({
      where: { id: existing.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isSuspended: true,
        suspendedUntil: true,
        suspensionReason: true,
      },
    });

    await writeAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: auditAction,
      targetType: "USER",
      targetId: existing.id,
      reason: parsed.data.reason ?? parsed.data.suspensionReason,
      before: existing,
      after: updated,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}
