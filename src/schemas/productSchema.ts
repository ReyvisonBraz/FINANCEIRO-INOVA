import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.enum(['product', 'service']),
  sku: z.string().optional(),
  unitPrice: z.number().refine((val) => val >= 0, 'Preço deve ser maior ou igual a zero'),
  stockLevel: z.number().optional().default(0),
});

export type ProductFormData = z.infer<typeof productSchema>;
