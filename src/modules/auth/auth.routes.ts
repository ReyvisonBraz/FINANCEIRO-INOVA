import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { verifyToken } from "../../shared/middleware/auth.js";
import { LoginSchema, ChangePasswordSchema } from "./auth.schema.js";
import * as AuthController from "./auth.controller.js";

const router = Router();

// POST /api/auth/login
router.post("/login", validate(LoginSchema), AuthController.login);

// GET /api/auth/me  (requer token)
router.get("/me", verifyToken, AuthController.me);

// PUT /api/auth/change-password  (requer token)
router.put("/change-password", verifyToken, validate(ChangePasswordSchema), AuthController.changePassword);

export default router;
