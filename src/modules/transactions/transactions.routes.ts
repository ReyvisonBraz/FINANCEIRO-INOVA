import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { verifyToken, requireRole } from "../../shared/middleware/auth.js";
import { CreateTransactionSchema, UpdateTransactionSchema } from "./transactions.schema.js";
import * as TransactionController from "./transactions.controller.js";

const router = Router();

// Todas as rotas exigem autenticação
router.use(verifyToken);

// GET /api/transactions            — listar com filtros e paginação
router.get("/", TransactionController.list);

// GET /api/transactions/summary    — totais income/expense/balance
router.get("/summary", TransactionController.summary);

// GET /api/transactions/:id
router.get("/:id", TransactionController.getOne);

// POST /api/transactions
router.post("/", validate(CreateTransactionSchema), TransactionController.create);

// PUT /api/transactions/:id
router.put("/:id", validate(UpdateTransactionSchema), TransactionController.update);

// DELETE /api/transactions/:id     — apenas owner/manager
router.delete("/:id", requireRole("owner", "manager"), TransactionController.remove);

export default router;
