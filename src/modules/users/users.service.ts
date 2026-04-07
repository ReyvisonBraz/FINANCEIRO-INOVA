import bcrypt from "bcryptjs";
import { prisma } from "../../shared/lib/prisma.js";
import { parsePagination, buildMeta } from "../../shared/lib/pagination.js";
import { createAuditLog } from "../../shared/lib/audit.js";
import type { CreateUserInput, UpdateUserInput, ResetPasswordInput, UserFilter } from "./users.schema.js";

const SAFE_SELECT = {
  id: true,
  username: true,
  name: true,
  role: true,
  permissions: true,
  createdAt: true,
  updatedAt: true,
};

export async function listUsers(filter: UserFilter) {
  const { page, limit } = parsePagination(filter);

  const where: Record<string, unknown> = {};
  if (filter.role) where.role = filter.role;
  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: "insensitive" } },
      { username: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: SAFE_SELECT,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
}

export async function getUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
  if (!user) throw new Error("Usuário não encontrado");
  return user;
}

export async function createUser(input: CreateUserInput, requesterId?: number) {
  const exists = await prisma.user.findUnique({ where: { username: input.username } });
  if (exists) throw new Error("Username já está em uso");

  const hashed = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      ...input,
      password: hashed,
      permissions: JSON.stringify(input.permissions ?? []),
    },
    select: SAFE_SELECT,
  });

  await createAuditLog("CREATE", "User", user.id, `Usuário ${user.username} criado`, requesterId);
  return user;
}

export async function updateUser(id: number, input: UpdateUserInput, requesterId?: number) {
  await getUser(id);
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...input,
      ...(input.permissions ? { permissions: JSON.stringify(input.permissions) } : {}),
    },
    select: SAFE_SELECT,
  });
  await createAuditLog("UPDATE", "User", id, `Usuário ${updated.username} atualizado`, requesterId);
  return updated;
}

export async function resetPassword(id: number, input: ResetPasswordInput, requesterId?: number) {
  await getUser(id);
  const hashed = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  await createAuditLog("UPDATE", "User", id, `Senha do usuário #${id} redefinida`, requesterId);
}

export async function deleteUser(id: number, requesterId?: number) {
  if (id === requesterId) throw new Error("Não é possível remover a própria conta");
  await getUser(id);
  await prisma.user.delete({ where: { id } });
  await createAuditLog("DELETE", "User", id, `Usuário #${id} removido`, requesterId);
}
