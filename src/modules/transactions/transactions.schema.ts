import { z } from "zod";

export const CreateTransactionSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  category: z.string().min(1, "Categoria obrigatória"),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Data inválida (YYYY-MM-DD)"),
  status: z.string().optional(),
  paymentMethod: z.string().optional().nullable(),
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial();

export const TransactionFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type TransactionFilter = z.infer<typeof TransactionFilterSchema>;
