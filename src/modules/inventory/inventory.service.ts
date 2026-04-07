import { prisma } from "../../shared/lib/prisma.js";
import { parsePagination, buildMeta } from "../../shared/lib/pagination.js";
import { createAuditLog } from "../../shared/lib/audit.js";
import type {
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  AdjustStockInput,
  InventoryFilter,
} from "./inventory.schema.js";

export async function listItems(filter: InventoryFilter) {
  const { page, limit } = parsePagination(filter);

  const where: Record<string, unknown> = {};
  if (filter.category) where.category = filter.category;
  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: "insensitive" } },
      { sku: { contains: filter.search } },
    ];
  }
  // Filtrar itens com estoque abaixo do mínimo
  if (filter.lowStock === "true") {
    where.AND = [
      { quantity: { not: null } },
      { minQuantity: { not: null } },
    ];
  }

  const items = await prisma.inventoryItem.findMany({
    where,
    orderBy: { name: "asc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.inventoryItem.count({ where });

  const data =
    filter.lowStock === "true"
      ? items.filter((i) => (i.quantity ?? 0) <= (i.minQuantity ?? 5))
      : items;

  return { data, meta: buildMeta(total, page, limit) };
}

export async function getItem(id: number) {
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) throw new Error("Item não encontrado");
  return item;
}

export async function createItem(input: CreateInventoryItemInput, userId?: number) {
  const item = await prisma.inventoryItem.create({
    data: { ...input, createdBy: userId },
  });
  await createAuditLog("CREATE", "InventoryItem", item.id, item.name, userId);
  return item;
}

export async function updateItem(id: number, input: UpdateInventoryItemInput, userId?: number) {
  await getItem(id);
  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: { ...input, updatedBy: userId },
  });
  await createAuditLog("UPDATE", "InventoryItem", id, updated.name, userId);
  return updated;
}

export async function adjustStock(id: number, input: AdjustStockInput, userId?: number) {
  const item = await getItem(id);
  const newQty = (item.quantity ?? 0) + input.quantity;

  if (newQty < 0) throw new Error("Estoque insuficiente");

  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: { quantity: newQty, stockLevel: newQty, updatedBy: userId },
  });

  await createAuditLog(
    "UPDATE",
    "InventoryItem",
    id,
    `Ajuste de estoque: ${input.quantity > 0 ? "+" : ""}${input.quantity} — ${input.reason ?? ""}`,
    userId
  );

  return updated;
}

export async function deleteItem(id: number, userId?: number) {
  await getItem(id);
  await prisma.inventoryItem.delete({ where: { id } });
  await createAuditLog("DELETE", "InventoryItem", id, `Item #${id} removido`, userId);
}

export async function getLowStockAlerts() {
  const items = await prisma.inventoryItem.findMany({
    where: { category: "product" },
  });
  return items.filter((i) => (i.quantity ?? 0) <= (i.minQuantity ?? 5));
}
