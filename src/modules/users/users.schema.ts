import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().min(3, "Usuário deve ter no mínimo 3 caracteres"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  name: z.string().min(1, "Nome obrigatório"),
  role: z.enum(["owner", "manager", "employee"]).optional(),
  permissions: z.array(z.string()).optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["owner", "manager", "employee"]).optional(),
  permissions: z.array(z.string()).optional(),
});

export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const UserFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  role: z.enum(["owner", "manager", "employee"]).optional(),
  search: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type UserFilter = z.infer<typeof UserFilterSchema>;
