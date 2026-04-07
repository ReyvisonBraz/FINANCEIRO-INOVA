import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../shared/lib/prisma.js";
import { createAuditLog } from "../../shared/lib/audit.js";
import type { LoginInput, ChangePasswordInput } from "./auth.schema.js";

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { username: input.username } });

  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw new Error("Usuário ou senha inválidos");
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role, name: user.name },
    process.env.JWT_SECRET ?? "secret",
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"] }
  );

  await createAuditLog("LOGIN", "User", user.id, `Login de ${user.username}`, user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: JSON.parse(user.permissions ?? "[]"),
    },
  };
}

export async function changePassword(userId: number, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuário não encontrado");

  const valid = await bcrypt.compare(input.currentPassword, user.password);
  if (!valid) throw new Error("Senha atual incorreta");

  const hashed = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  await createAuditLog("UPDATE", "User", userId, "Senha alterada", userId);
}

export async function me(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, name: true, role: true, permissions: true, createdAt: true },
  });
  if (!user) throw new Error("Usuário não encontrado");
  return { ...user, permissions: JSON.parse(user.permissions ?? "[]") };
}
