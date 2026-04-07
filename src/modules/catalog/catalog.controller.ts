import { Request, Response, NextFunction } from "express";
import * as CatalogService from "./catalog.service.js";

// ─── Marcas ───────────────────────────────────────────────────────────────────
export async function listBrands(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await CatalogService.listBrands(req.query.equipmentType as string | undefined));
  } catch (err) { next(err); }
}

export async function createBrand(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await CatalogService.createBrand(req.body, req.user?.userId));
  } catch (err) { next(err); }
}

export async function updateBrand(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await CatalogService.updateBrand(parseInt(req.params.id, 10), req.body, req.user?.userId));
  } catch (err) { next(err); }
}

export async function deleteBrand(req: Request, res: Response, next: NextFunction) {
  try {
    await CatalogService.deleteBrand(parseInt(req.params.id, 10), req.user?.userId);
    res.status(204).send();
  } catch (err) { next(err); }
}

// ─── Modelos ──────────────────────────────────────────────────────────────────
export async function listModels(req: Request, res: Response, next: NextFunction) {
  try {
    const brandId = req.query.brandId ? parseInt(req.query.brandId as string, 10) : undefined;
    res.json(await CatalogService.listModels(brandId));
  } catch (err) { next(err); }
}

export async function createModel(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await CatalogService.createModel(req.body, req.user?.userId));
  } catch (err) { next(err); }
}

export async function updateModel(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await CatalogService.updateModel(parseInt(req.params.id, 10), req.body, req.user?.userId));
  } catch (err) { next(err); }
}

export async function deleteModel(req: Request, res: Response, next: NextFunction) {
  try {
    await CatalogService.deleteModel(parseInt(req.params.id, 10), req.user?.userId);
    res.status(204).send();
  } catch (err) { next(err); }
}

// ─── Tipos de Equipamento ─────────────────────────────────────────────────────
export async function listEquipmentTypes(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await CatalogService.listEquipmentTypes());
  } catch (err) { next(err); }
}

export async function createEquipmentType(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await CatalogService.createEquipmentType(req.body, req.user?.userId));
  } catch (err) { next(err); }
}

export async function updateEquipmentType(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await CatalogService.updateEquipmentType(parseInt(req.params.id, 10), req.body, req.user?.userId));
  } catch (err) { next(err); }
}

export async function deleteEquipmentType(req: Request, res: Response, next: NextFunction) {
  try {
    await CatalogService.deleteEquipmentType(parseInt(req.params.id, 10), req.user?.userId);
    res.status(204).send();
  } catch (err) { next(err); }
}
