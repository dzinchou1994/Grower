import { NextResponse } from "next/server";
import { AuditActionType, AuditTargetType } from "@prisma/client";
import { adminErrorResponse, requireAdmin } from "@/lib/admin-authz";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(200, Math.max(1, Number(searchParams.get("pageSize") ?? "30")));
    const skip = (page - 1) * pageSize;

    const action = searchParams.get("action");
    const targetType = searchParams.get("targetType");
    const actorId = searchParams.get("actorId");
    const targetId = searchParams.get("targetId");

    const where = {
      ...(action && Object.values(AuditActionType).includes(action as AuditActionType)
        ? { action: action as AuditActionType }
        : {}),
      ...(targetType && Object.values(AuditTargetType).includes(targetType as AuditTargetType)
        ? { targetType: targetType as AuditTargetType }
        : {}),
      ...(actorId ? { actorId } : {}),
      ...(targetId ? { targetId } : {}),
    };

    const [total, logs] = await Promise.all([
      db.auditLog.count({ where }),
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      page,
      pageSize,
      total,
      logs: logs.map((log) => ({
        ...log,
        before: log.beforeJson ? safeJsonParse(log.beforeJson) : null,
        after: log.afterJson ? safeJsonParse(log.afterJson) : null,
      })),
    });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
