import { Request, Response, NextFunction } from "express";
import * as ServiceOrderService from "./service-orders.service.js";

const notFound = (res: Response, err: Error) => {
  if (err.message === "Ordem de serviço não encontrada") {
    res.status(404).json({ error: err.message });
    return true;
  }
  return false;
};

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await ServiceOrderService.listServiceOrders(req.query as Record<string, string>));
  } catch (err) { next(err); }
}

export async function statusSummary(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await ServiceOrderService.getStatusSummary());
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await ServiceOrderService.getServiceOrder(parseInt(req.params.id, 10)));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await ServiceOrderService.createServiceOrder(req.body, req.user?.userId));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await ServiceOrderService.updateServiceOrder(parseInt(req.params.id, 10), req.body, req.user?.userId));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await ServiceOrderService.deleteServiceOrder(parseInt(req.params.id, 10), req.user?.userId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}
