import { Router } from "express";
import { verifyToken, requireRole } from "../../shared/middleware/auth.js";
import * as AuditController from "./audit.controller.js";

const router = Router();

// Apenas owner/manager podem ver logs de auditoria
router.use(verifyToken, requireRole("owner", "manager"));

// GET /api/audit           — listar logs com filtros
router.get("/", AuditController.list);

// GET /api/audit/stats     — estatísticas por entidade e ação
router.get("/stats", AuditController.stats);

export default router;
