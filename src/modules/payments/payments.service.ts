import { prisma } from "../../shared/lib/prisma.js";
import { parsePagination, buildMeta } from "../../shared/lib/pagination.js";
import { createAuditLog } from "../../shared/lib/audit.js";
import type {
  CreatePaymentInput,
  UpdatePaymentInput,
  RecordPaymentInput,
  PaymentFilter,
} from "./payments.schema.js";
import type { PaymentHistoryEntry } from "../../shared/types/index.js";

export async function listPayments(filter: PaymentFilter) {
  const { page, limit } = parsePagination(filter);

  const where: Record<string, unknown> = {};
  if (filter.status) where.status = filter.status;
  if (filter.customerId) where.customerId = parseInt(filter.customerId, 10);
  if (filter.search) {
    where.description = { contains: filter.search, mode: "insensitive" };
  }
  if (filter.startDate || filter.endDate) {
    where.dueDate = {
      ...(filter.startDate ? { gte: filter.startDate } : {}),
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  const [data, total] = await Promise.all([
    prisma.clientPayment.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { customer: { select: { id: true, firstName: true, lastName: true, phone: true } } },
    }),
    prisma.clientPayment.count({ where }),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
}

export async function getPayment(id: number) {
  const payment = await prisma.clientPayment.findUnique({
    where: { id },
    include: {
      customer: true,
      Receipts: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!payment) throw new Error("Pagamento não encontrado");
  return payment;
}

export async function createPayment(input: CreatePaymentInput, userId?: number) {
  const payment = await prisma.clientPayment.create({
    data: { ...input, createdBy: userId },
  });
  await createAuditLog("CREATE", "ClientPayment", payment.id, input.description, userId);
  return payment;
}

export async function updatePayment(id: number, input: UpdatePaymentInput, userId?: number) {
  await getPayment(id);
  const updated = await prisma.clientPayment.update({
    where: { id },
    data: { ...input, updatedBy: userId },
  });
  await createAuditLog("UPDATE", "ClientPayment", id, updated.description, userId);
  return updated;
}

export async function recordPayment(id: number, input: RecordPaymentInput, userId?: number) {
  const payment = await getPayment(id);

  const history: PaymentHistoryEntry[] = JSON.parse(payment.paymentHistory ?? "[]");
  history.push({ date: input.date, amount: input.amount, method: input.method, note: input.note });

  const newPaid = (payment.paidAmount ?? 0) + input.amount;
  const newStatus =
    newPaid >= payment.totalAmount ? "paid" : newPaid > 0 ? "partial" : "pending";

  const updated = await prisma.clientPayment.update({
    where: { id },
    data: {
      paidAmount: newPaid,
      status: newStatus,
      paymentHistory: JSON.stringify(history),
      updatedBy: userId,
    },
  });

  await createAuditLog(
    "UPDATE",
    "ClientPayment",
    id,
    `Pagamento registrado: R$ ${input.amount.toFixed(2)}`,
    userId
  );

  // Gerar recibo automático
  const receipt = await prisma.receipt.create({
    data: {
      paymentId: id,
      content: JSON.stringify({ payment: updated, entry: input, generatedAt: new Date().toISOString() }),
    },
  });

  return { payment: updated, receipt };
}

export async function deletePayment(id: number, userId?: number) {
  await getPayment(id);
  await prisma.clientPayment.delete({ where: { id } });
  await createAuditLog("DELETE", "ClientPayment", id, `Pagamento #${id} removido`, userId);
}

export async function getPaymentSummary() {
  const [pending, partial, paid] = await Promise.all([
    prisma.clientPayment.aggregate({ where: { status: "pending" }, _sum: { totalAmount: true }, _count: true }),
    prisma.clientPayment.aggregate({ where: { status: "partial" }, _sum: { totalAmount: true }, _sum2: { paidAmount: true } as never, _count: true }),
    prisma.clientPayment.aggregate({ where: { status: "paid" }, _sum: { totalAmount: true }, _count: true }),
  ]);

  return {
    pending: { count: pending._count, total: pending._sum.totalAmount ?? 0 },
    partial: { count: partial._count, total: partial._sum.totalAmount ?? 0 },
    paid: { count: paid._count, total: paid._sum.totalAmount ?? 0 },
  };
}
