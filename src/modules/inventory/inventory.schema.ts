import { z } from "zod";

export const CreateInventoryItemSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  category: z.enum(["product", "service"]),
  sku: z.string().optional().nullable(),
  unitPrice: z.number().nonnegative(),
  costPrice: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative().optional(),
  minQuantity: z.number().int().nonnegative().optional(),
  stockLevel: z.number().int().nonnegative().optional(),
});

export const UpdateInventoryItemSchema = CreateInventoryItemSchema.partial();

export const AdjustStockSchema = z.object({
  quantity: z.number().int(),
  reason: z.string().optional(),
});

export const InventoryFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.enum(["product", "service"]).optional(),
  search: z.string().optional(),
  lowStock: z.string().optional(), // "true" para filtrar itens abaixo do mínimo
});

export type CreateInventoryItemInput = z.infer<typeof CreateInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof UpdateInventoryItemSchema>;
export type AdjustStockInput = z.infer<typeof AdjustStockSchema>;
export type InventoryFilter = z.infer<typeof InventoryFilterSchema>;
