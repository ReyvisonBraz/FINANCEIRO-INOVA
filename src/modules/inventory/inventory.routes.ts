import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { verifyToken, requireRole } from "../../shared/middleware/auth.js";
import { CreateInventoryItemSchema, UpdateInventoryItemSchema, AdjustStockSchema } from "./inventory.schema.js";
import * as InventoryController from "./inventory.controller.js";

const router = Router();

router.use(verifyToken);

// GET /api/inventory
router.get("/", InventoryController.list);

// GET /api/inventory/alerts  — itens abaixo do estoque mínimo
router.get("/alerts", InventoryController.lowStockAlerts);

// GET /api/inventory/:id
router.get("/:id", InventoryController.getOne);

// POST /api/inventory
router.post("/", validate(CreateInventoryItemSchema), InventoryController.create);

// PUT /api/inventory/:id
router.put("/:id", validate(UpdateInventoryItemSchema), InventoryController.update);

// PATCH /api/inventory/:id/stock  — ajuste de estoque (+/-)
router.patch("/:id/stock", validate(AdjustStockSchema), InventoryController.adjustStock);

// DELETE /api/inventory/:id  — owner/manager
router.delete("/:id", requireRole("owner", "manager"), InventoryController.remove);

export default router;
