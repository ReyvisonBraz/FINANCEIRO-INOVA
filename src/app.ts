import "dotenv/config";
import express from "express";
import cors from "cors";

import { errorHandler } from "./shared/middleware/error.js";

// Módulos — Fase 1
import authRoutes from "./modules/auth/auth.routes.js";

// Módulos — Fase 2
import transactionRoutes from "./modules/transactions/transactions.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";

// Módulos — Fase 3
import customerRoutes from "./modules/customers/customers.routes.js";
import paymentRoutes from "./modules/payments/payments.routes.js";

// Módulos — Fase 4
import serviceOrderRoutes from "./modules/service-orders/service-orders.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";

// Módulos — Fase 5
import userRoutes from "./modules/users/users.routes.js";
import catalogRoutes from "./modules/catalog/catalog.routes.js";

const app = express();

// ─── Middlewares globais ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" })); // 10mb para suportar fotos Base64
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "financeiro-inova-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── Rotas ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// Fase 2
app.use("/api/transactions", transactionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/audit", auditRoutes);

// Fase 3
app.use("/api/customers", customerRoutes);
app.use("/api/payments", paymentRoutes);

// Fase 4
app.use("/api/service-orders", serviceOrderRoutes);
app.use("/api/inventory", inventoryRoutes);

// Fase 5
app.use("/api/users", userRoutes);
app.use("/api/catalog", catalogRoutes);

// ─── Handler de erros (sempre por último) ────────────────────────────────────
app.use(errorHandler);

// ─── Inicialização ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`🚀 financeiro-inova-api rodando em http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Ambiente: ${process.env.NODE_ENV ?? "development"}`);
});

export default app;
