import { prisma } from "../../shared/lib/prisma.js";
import { parsePagination, buildMeta } from "../../shared/lib/pagination.js";
import { createAuditLog } from "../../shared/lib/audit.js";
import type { CreateCustomerInput, UpdateCustomerInput, CustomerFilter } from "./customers.schema.js";

export async function listCustomers(filter: CustomerFilter) {
  const { page, limit } = parsePagination(filter);

  const where = filter.search
    ? {
        OR: [
          { firstName: { contains: filter.search, mode: "insensitive" as const } },
          { lastName: { contains: filter.search, mode: "insensitive" as const } },
          { nickname: { contains: filter.search, mode: "insensitive" as const } },
          { phone: { contains: filter.search } },
          { cpf: { contains: filter.search } },
          { companyName: { contains: filter.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { firstName: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
}

export async function getCustomer(id: number) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      ClientPayments: { orderBy: { id: "desc" }, take: 10 },
      ServiceOrders: { orderBy: { id: "desc" }, take: 10 },
    },
  });
  if (!customer) throw new Error("Cliente não encontrado");
  return customer;
}

export async function findDuplicates(cpf?: string | null, phone?: string) {
  if (!cpf && !phone) return [];
  return prisma.customer.findMany({
    where: {
      OR: [
        ...(cpf ? [{ cpf }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    },
  });
}

export async function createCustomer(input: CreateCustomerInput, userId?: number) {
  const customer = await prisma.customer.create({
    data: { ...input, createdBy: userId },
  });
  await createAuditLog("CREATE", "Customer", customer.id, `${customer.firstName} ${customer.lastName}`, userId);
  return customer;
}

export async function updateCustomer(id: number, input: UpdateCustomerInput, userId?: number) {
  await getCustomer(id);
  const updated = await prisma.customer.update({
    where: { id },
    data: { ...input, updatedBy: userId },
  });
  await createAuditLog("UPDATE", "Customer", id, `${updated.firstName} ${updated.lastName}`, userId);
  return updated;
}

export async function deleteCustomer(id: number, userId?: number) {
  await getCustomer(id);
  await prisma.customer.delete({ where: { id } });
  await createAuditLog("DELETE", "Customer", id, `Cliente #${id} removido`, userId);
}
