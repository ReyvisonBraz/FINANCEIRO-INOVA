import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { verifyToken, requireRole } from "../../shared/middleware/auth.js";
import { CreateCustomerSchema, UpdateCustomerSchema } from "./customers.schema.js";
import * as CustomerController from "./customers.controller.js";

const router = Router();

router.use(verifyToken);

// GET /api/customers
router.get("/", CustomerController.list);

// GET /api/customers/check-duplicates?cpf=...&phone=...
router.get("/check-duplicates", CustomerController.checkDuplicates);

// GET /api/customers/:id
router.get("/:id", CustomerController.getOne);

// POST /api/customers
router.post("/", validate(CreateCustomerSchema), CustomerController.create);

// PUT /api/customers/:id
router.put("/:id", validate(UpdateCustomerSchema), CustomerController.update);

// DELETE /api/customers/:id  — owner/manager
router.delete("/:id", requireRole("owner", "manager"), CustomerController.remove);

export default router;
