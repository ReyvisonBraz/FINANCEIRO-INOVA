import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { verifyToken, requireRole } from "../../shared/middleware/auth.js";
import { CreateUserSchema, UpdateUserSchema, ResetPasswordSchema } from "./users.schema.js";
import * as UserController from "./users.controller.js";

const router = Router();

// Todas as rotas de usuários exigem owner
router.use(verifyToken, requireRole("owner"));

// GET /api/users
router.get("/", UserController.list);

// GET /api/users/:id
router.get("/:id", UserController.getOne);

// POST /api/users
router.post("/", validate(CreateUserSchema), UserController.create);

// PUT /api/users/:id
router.put("/:id", validate(UpdateUserSchema), UserController.update);

// PUT /api/users/:id/reset-password
router.put("/:id/reset-password", validate(ResetPasswordSchema), UserController.resetPassword);

// DELETE /api/users/:id
router.delete("/:id", UserController.remove);

export default router;
