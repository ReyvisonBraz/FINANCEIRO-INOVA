import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { verifyToken, requireRole } from "../../shared/middleware/auth.js";
import {
  CreateBrandSchema,
  UpdateBrandSchema,
  CreateModelSchema,
  UpdateModelSchema,
  CreateEquipmentTypeSchema,
  UpdateEquipmentTypeSchema,
} from "./catalog.schema.js";
import * as CatalogController from "./catalog.controller.js";

const router = Router();

// Leitura pública, escrita exige owner/manager

// ─── Marcas ───────────────────────────────────────────────────────────────────
// GET /api/catalog/brands?equipmentType=Notebook
router.get("/brands", CatalogController.listBrands);
router.post("/brands", verifyToken, requireRole("owner", "manager"), validate(CreateBrandSchema), CatalogController.createBrand);
router.put("/brands/:id", verifyToken, requireRole("owner", "manager"), validate(UpdateBrandSchema), CatalogController.updateBrand);
router.delete("/brands/:id", verifyToken, requireRole("owner", "manager"), CatalogController.deleteBrand);

// ─── Modelos ──────────────────────────────────────────────────────────────────
// GET /api/catalog/models?brandId=1
router.get("/models", CatalogController.listModels);
router.post("/models", verifyToken, requireRole("owner", "manager"), validate(CreateModelSchema), CatalogController.createModel);
router.put("/models/:id", verifyToken, requireRole("owner", "manager"), validate(UpdateModelSchema), CatalogController.updateModel);
router.delete("/models/:id", verifyToken, requireRole("owner", "manager"), CatalogController.deleteModel);

// ─── Tipos de Equipamento ─────────────────────────────────────────────────────
router.get("/equipment-types", CatalogController.listEquipmentTypes);
router.post("/equipment-types", verifyToken, requireRole("owner", "manager"), validate(CreateEquipmentTypeSchema), CatalogController.createEquipmentType);
router.put("/equipment-types/:id", verifyToken, requireRole("owner", "manager"), validate(UpdateEquipmentTypeSchema), CatalogController.updateEquipmentType);
router.delete("/equipment-types/:id", verifyToken, requireRole("owner", "manager"), CatalogController.deleteEquipmentType);

export default router;
