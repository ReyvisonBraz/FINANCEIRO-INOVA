import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { verifyToken, requireRole } from "../../shared/middleware/auth.js";
import { UpdateSettingsSchema } from "./settings.schema.js";
import * as SettingsController from "./settings.controller.js";

const router = Router();

// GET /api/settings   — leitura pública (sem auth) para o frontend carregar configs
router.get("/", SettingsController.get);

// PUT /api/settings   — apenas owner
router.put("/", verifyToken, requireRole("owner"), validate(UpdateSettingsSchema), SettingsController.update);

export default router;
