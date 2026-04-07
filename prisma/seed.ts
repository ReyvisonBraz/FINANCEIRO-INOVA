import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // ─── Usuário admin padrão ────────────────────────────────────────────────
  const existingAdmin = await prisma.user.findUnique({ where: { username: "admin" } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        name: "Administrador",
        role: "owner",
        permissions: "[]",
      },
    });
    console.log(`✅ Usuário admin criado (id: ${admin.id})`);
    console.log("   Username: admin | Senha: admin123 ← TROQUE EM PRODUÇÃO!");
  } else {
    console.log("ℹ️  Usuário admin já existe, pulando...");
  }

  // ─── Configurações iniciais ───────────────────────────────────────────────
  const existingSettings = await prisma.settings.findUnique({ where: { id: 1 } });

  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        id: 1,
        appName: "Financeiro Inova",
        appVersion: "Versão Empresarial",
        fiscalYear: new Date().getFullYear().toString(),
        primaryColor: "#1152d4",
        profileName: "Inova Informática",
      },
    });
    console.log("✅ Configurações iniciais criadas");
  } else {
    console.log("ℹ️  Configurações já existem, pulando...");
  }

  // ─── Status padrão de Ordens de Serviço ──────────────────────────────────
  const statusCount = await prisma.serviceOrderStatus.count();

  if (statusCount === 0) {
    await prisma.serviceOrderStatus.createMany({
      data: [
        { name: "Aguardando Diagnóstico", color: "#f59e0b", priority: 0, isDefault: 1 },
        { name: "Em Análise",             color: "#3b82f6", priority: 1, isDefault: 0 },
        { name: "Em Manutenção",          color: "#8b5cf6", priority: 2, isDefault: 0 },
        { name: "Aguardando Peça",        color: "#ef4444", priority: 3, isDefault: 0 },
        { name: "Pronto para Retirada",   color: "#10b981", priority: 4, isDefault: 0 },
        { name: "Entregue",               color: "#6b7280", priority: 5, isDefault: 0 },
        { name: "Cancelado",              color: "#dc2626", priority: 6, isDefault: 0 },
      ],
    });
    console.log("✅ Status padrão de OS criados");
  } else {
    console.log("ℹ️  Status de OS já existem, pulando...");
  }

  // ─── Tipos de equipamento padrão ─────────────────────────────────────────
  const typeCount = await prisma.equipmentType.count();

  if (typeCount === 0) {
    await prisma.equipmentType.createMany({
      data: [
        { name: "Notebook",    icon: "laptop" },
        { name: "Desktop",     icon: "monitor" },
        { name: "Smartphone",  icon: "smartphone" },
        { name: "Tablet",      icon: "tablet" },
        { name: "Impressora",  icon: "printer" },
        { name: "Outro",       icon: "cpu" },
      ],
    });
    console.log("✅ Tipos de equipamento criados");
  } else {
    console.log("ℹ️  Tipos de equipamento já existem, pulando...");
  }

  console.log("\n🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
