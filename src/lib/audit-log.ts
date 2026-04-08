import type { AuditActionType, AuditTargetType, UserRole } from "@prisma/client";
import { db } from "@/lib/db";

export async function writeAuditLog(input: {
  actorId?: string | null;
  actorRole?: UserRole;
  action: AuditActionType;
  targetType: AuditTargetType;
  targetId: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
}) {
  await db.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      actorRole: input.actorRole,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      beforeJson: input.before ? JSON.stringify(input.before) : null,
      afterJson: input.after ? JSON.stringify(input.after) : null,
    },
  });
}
