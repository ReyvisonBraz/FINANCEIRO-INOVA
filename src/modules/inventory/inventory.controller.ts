import { Request, Response, NextFunction } from "express";
import * as InventoryService from "./inventory.service.js";

const notFound = (res: Response, err: Error) => {
  if (err.message === "Item não encontrado") {
    res.status(404).json({ error: err.message });
    return true;
  }
  return false;
};

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await InventoryService.listItems(req.query as Record<string, string>));
  } catch (err) { next(err); }
}

export async function lowStockAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await InventoryService.getLowStockAlerts());
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await InventoryService.getItem(parseInt(req.params.id, 10)));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await InventoryService.createItem(req.body, req.user?.userId));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await InventoryService.updateItem(parseInt(req.params.id, 10), req.body, req.user?.userId));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function adjustStock(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await InventoryService.adjustStock(parseInt(req.params.id, 10), req.body, req.user?.userId);
    res.json(result);
  } catch (err) {
    if (err instanceof Error) {
      if (notFound(res, err)) return;
      if (err.message === "Estoque insuficiente") {
        res.status(400).json({ error: err.message });
        return;
      }
    }
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await InventoryService.deleteItem(parseInt(req.params.id, 10), req.user?.userId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}
