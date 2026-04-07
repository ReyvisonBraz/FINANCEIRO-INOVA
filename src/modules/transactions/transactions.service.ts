import { prisma } from "../../shared/lib/prisma.js";
import { parsePagination, buildMeta } from "../../shared/lib/pagination.js";
import { createAuditLog } from "../../shared/lib/audit.js";
import type { CreateTransactionInput, UpdateTransactionInput, TransactionFilter } from "./transactions.schema.js";

export async function listTransactions(filter: TransactionFilter) {
  const { page, limit } = parsePagination(filter);

  const where: Record<string, unknown> = {};

  if (filter.type) where.type = filter.type;
  if (filter.category) where.category = filter.category;
  if (filter.status) where.status = filter.status;
  if (filter.search) {
    where.description = { contains: filter.search, mode: "insensitive" };
  }
  if (filter.startDate || filter.endDate) {
    where.date = {
      ...(filter.startDate ? { gte: filter.startDate } : {}),
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
}

export async function getTransaction(id: number) {
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) throw new Error("Transação não encontrada");
  return transaction;
}

export async function createTransaction(input: CreateTransactionInput, userId?: number) {
  const transaction = await prisma.transaction.create({
    data: { ...input, createdBy: userId },
  });
  await createAuditLog("CREATE", "Transaction", transaction.id, transaction.description, userId);
  return transaction;
}

export async function updateTransaction(id: number, input: UpdateTransactionInput, userId?: number) {
  await getTransaction(id); // valida existência
  const updated = await prisma.transaction.update({
    where: { id },
    data: { ...input, updatedBy: userId },
  });
  await createAuditLog("UPDATE", "Transaction", id, updated.description, userId);
  return updated;
}

export async function deleteTransaction(id: number, userId?: number) {
  await getTransaction(id); // valida existência
  await prisma.transaction.delete({ where: { id } });
  await createAuditLog("DELETE", "Transaction", id, `Transação #${id} removida`, userId);
}

export async function getSummary() {
  const [incomeAgg, expenseAgg, count] = await Promise.all([
    prisma.transaction.aggregate({ where: { type: "income" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "expense" }, _sum: { amount: true } }),
    prisma.transaction.count(),
  ]);

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpense = expenseAgg._sum.amount ?? 0;

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    count,
  };
}
