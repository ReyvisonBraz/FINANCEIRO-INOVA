import { prisma } from "../../shared/lib/prisma.js";
import { parsePagination, buildMeta } from "../../shared/lib/pagination.js";
import type { AuditFilter } from "./audit.schema.js";

export async function listAuditLogs(filter: AuditFilter) {
  const { page, limit } = parsePagination(filter);

  const where: Record<string, unknown> = {};

  if (filter.entity) where.entity = filter.entity;
  if (filter.action) where.action = filter.action;
  if (filter.userId) where.userId = parseInt(filter.userId, 10);
  if (filter.startDate || filter.endDate) {
    where.timestamp = {
      ...(filter.startDate ? { gte: new Date(filter.startDate) } : {}),
      ...(filter.endDate ? { lte: new Date(filter.endDate) } : {}),
    };
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, username: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
}

export async function getAuditStats() {
  const [byEntity, byAction, recent] = await Promise.all([
    prisma.auditLog.groupBy({
      by: ["entity"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.auditLog.groupBy({
      by: ["action"],
      _count: { id: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
      include: { user: { select: { name: true } } },
    }),
  ]);

  return { byEntity, byAction, recent };
}
