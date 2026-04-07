import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { verifyToken, requireRole } from "../../shared/middleware/auth.js";
import { CreateServiceOrderSchema, UpdateServiceOrderSchema } from "./service-orders.schema.js";
import * as ServiceOrderController from "./service-orders.controller.js";

const router = Router();

router.use(verifyToken);

// GET /api/service-orders
router.get("/", ServiceOrderController.list);

// GET /api/service-orders/status-summary
router.get("/status-summary", ServiceOrderController.statusSummary);

// GET /api/service-orders/:id
router.get("/:id", ServiceOrderController.getOne);

// POST /api/service-orders
router.post("/", validate(CreateServiceOrderSchema), ServiceOrderController.create);

// PUT /api/service-orders/:id
router.put("/:id", validate(UpdateServiceOrderSchema), ServiceOrderController.update);

// DELETE /api/service-orders/:id  — owner/manager
router.delete("/:id", requireRole("owner", "manager"), ServiceOrderController.remove);

export default router;
