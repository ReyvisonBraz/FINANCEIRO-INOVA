import { prisma } from "../../shared/lib/prisma.js";
import { createAuditLog } from "../../shared/lib/audit.js";
import type { UpdateSettingsInput } from "./settings.schema.js";

export async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: 1 } });

  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 1 } });
  }

  return settings;
}

export async function updateSettings(input: UpdateSettingsInput, userId?: number) {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, ...input },
    update: input,
  });

  await createAuditLog("UPDATE", "Settings", 1, "Configurações atualizadas", userId);
  return settings;
}
