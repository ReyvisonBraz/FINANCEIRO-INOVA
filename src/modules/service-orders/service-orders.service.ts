import { prisma } from "../../shared/lib/prisma.js";
import { parsePagination, buildMeta } from "../../shared/lib/pagination.js";
import { createAuditLog } from "../../shared/lib/audit.js";
import type {
  CreateServiceOrderInput,
  UpdateServiceOrderInput,
  ServiceOrderFilter,
} from "./service-orders.schema.js";

export async function listServiceOrders(filter: ServiceOrderFilter) {
  const { page, limit } = parsePagination(filter);

  const where: Record<string, unknown> = {};
  if (filter.status) where.status = filter.status;
  if (filter.priority) where.priority = filter.priority;
  if (filter.customerId) where.customerId = parseInt(filter.customerId, 10);
  if (filter.startDate || filter.endDate) {
    where.entryDate = {
      ...(filter.startDate ? { gte: filter.startDate } : {}),
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }
  if (filter.search) {
    where.OR = [
      { reportedProblem: { contains: filter.search, mode: "insensitive" } },
      { equipmentBrand: { contains: filter.search, mode: "insensitive" } },
      { equipmentModel: { contains: filter.search, mode: "insensitive" } },
      { equipmentSerial: { contains: filter.search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.serviceOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
    }),
    prisma.serviceOrder.count({ where }),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
}

export async function getServiceOrder(id: number) {
  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: { customer: true },
  });
  if (!order) throw new Error("Ordem de serviço não encontrada");
  return order;
}

export async function createServiceOrder(input: CreateServiceOrderInput, userId?: number) {
  const order = await prisma.serviceOrder.create({
    data: {
      ...input,
      entryDate: input.entryDate ?? new Date().toISOString().split("T")[0],
      createdBy: userId,
    },
    include: { customer: true },
  });
  await createAuditLog("CREATE", "ServiceOrder", order.id, `OS #${order.id} — ${input.reportedProblem}`, userId);
  return order;
}

export async function updateServiceOrder(id: number, input: UpdateServiceOrderInput, userId?: number) {
  await getServiceOrder(id);
  const updated = await prisma.serviceOrder.update({
    where: { id },
    data: { ...input, updatedBy: userId },
    include: { customer: true },
  });
  await createAuditLog("UPDATE", "ServiceOrder", id, `OS #${id} — status: ${updated.status}`, userId);
  return updated;
}

export async function deleteServiceOrder(id: number, userId?: number) {
  await getServiceOrder(id);
  await prisma.serviceOrder.delete({ where: { id } });
  await createAuditLog("DELETE", "ServiceOrder", id, `OS #${id} removida`, userId);
}

export async function getStatusSummary() {
  const statuses = await prisma.serviceOrderStatus.findMany({ orderBy: { priority: "asc" } });

  const counts = await prisma.serviceOrder.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count.id]));

  return statuses.map((s) => ({
    ...s,
    count: countMap[s.name] ?? 0,
  }));
}
