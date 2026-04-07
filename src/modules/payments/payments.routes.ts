import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { verifyToken, requireRole } from "../../shared/middleware/auth.js";
import { CreatePaymentSchema, UpdatePaymentSchema, RecordPaymentSchema } from "./payments.schema.js";
import * as PaymentController from "./payments.controller.js";

const router = Router();

router.use(verifyToken);

// GET /api/payments
router.get("/", PaymentController.list);

// GET /api/payments/summary
router.get("/summary", PaymentController.summary);

// GET /api/payments/:id
router.get("/:id", PaymentController.getOne);

// POST /api/payments
router.post("/", validate(CreatePaymentSchema), PaymentController.create);

// PUT /api/payments/:id
router.put("/:id", validate(UpdatePaymentSchema), PaymentController.update);

// POST /api/payments/:id/record  — registrar pagamento parcial ou total
router.post("/:id/record", validate(RecordPaymentSchema), PaymentController.recordPayment);

// DELETE /api/payments/:id  — owner/manager
router.delete("/:id", requireRole("owner", "manager"), PaymentController.remove);

export default router;
