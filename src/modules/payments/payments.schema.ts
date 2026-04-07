import { z } from "zod";

export const CreatePaymentSchema = z.object({
  customerId: z.number().int().positive(),
  description: z.string().min(1, "Descrição obrigatória"),
  totalAmount: z.number().positive("Valor deve ser positivo"),
  paidAmount: z.number().nonnegative().optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Data inválida"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Data inválida"),
  paymentMethod: z.string().min(1, "Forma de pagamento obrigatória"),
  status: z.enum(["pending", "partial", "paid"]).optional(),
  installmentsCount: z.number().int().positive().optional(),
  type: z.enum(["income", "expense"]).optional(),
  paymentHistory: z.string().optional(),
});

export const UpdatePaymentSchema = CreatePaymentSchema.partial();

export const RecordPaymentSchema = z.object({
  amount: z.number().positive("Valor deve ser positivo"),
  method: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Data inválida"),
  note: z.string().optional(),
});

export const PaymentFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(["pending", "partial", "paid"]).optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;
export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;
export type PaymentFilter = z.infer<typeof PaymentFilterSchema>;
