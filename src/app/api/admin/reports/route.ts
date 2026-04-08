import { NextResponse } from "next/server";
import { ReportStatus } from "@prisma/client";
import { z } from "zod";
import { adminErrorResponse, requireAdminOrModerator } from "@/lib/admin-authz";
import { writeAuditLog } from "@/lib/audit-log";
import { db } from "@/lib/db";

const updateReportSchema = z.object({
  reportId: z.string().min(1),
  status: z.nativeEnum(ReportStatus),
  reviewerNote: z.string().max(500).optional(),
  reason: z.string().max(500).optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdminOrModerator();
    const { searchParams } = new URL(request.url);
    const statusRaw = searchParams.get("status");
    const status = statusRaw && Object.values(ReportStatus).includes(statusRaw as ReportStatus)
      ? (statusRaw as ReportStatus)
      : undefined;
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
    const skip = (page - 1) * pageSize;

    const where = status ? { status } : {};

    const [total, reports] = await Promise.all([
      db.report.count({ where }),
      db.report.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
        include: {
          reporter: { select: { id: true, username: true, email: true } },
          reviewer: { select: { id: true, username: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      page,
      pageSize,
      total,
      reports,
    });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdminOrModerator();
    const payload = await request.json().catch(() => null);
    const parsed = updateReportSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await db.report.findUnique({
      where: { id: parsed.data.reportId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const updated = await db.report.update({
      where: { id: parsed.data.reportId },
      data: {
        status: parsed.data.status,
        reviewerId: session.userId,
        reviewerNote: parsed.data.reviewerNote,
      },
    });

    await writeAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: "REPORT_REVIEW",
      targetType: "REPORT",
      targetId: updated.id,
      reason: parsed.data.reason ?? parsed.data.reviewerNote,
      before: existing,
      after: updated,
    });

    return NextResponse.json({ report: updated });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}
