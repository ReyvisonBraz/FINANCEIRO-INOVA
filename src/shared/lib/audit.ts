import { prisma } from "./prisma.js";

export async function createAuditLog(
  action: string,
  entity: string,
  entityId?: number,
  details?: string,
  userId?: number
) {
  await prisma.auditLog.create({
    data: { action, entity, entityId, details, userId },
  });
}
