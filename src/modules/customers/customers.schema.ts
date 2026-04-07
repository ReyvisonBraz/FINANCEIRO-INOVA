import { z } from "zod";

export const CreateCustomerSchema = z.object({
  firstName: z.string().min(1, "Nome obrigatório"),
  lastName: z.string().min(1, "Sobrenome obrigatório"),
  nickname: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  phone: z.string().min(1, "Telefone obrigatório"),
  observation: z.string().optional().nullable(),
  creditLimit: z.number().nonnegative().optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export const CustomerFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(), // busca em firstName, lastName, nickname, cpf, phone
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type CustomerFilter = z.infer<typeof CustomerFilterSchema>;
