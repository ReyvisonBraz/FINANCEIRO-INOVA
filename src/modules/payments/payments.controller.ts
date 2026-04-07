import { Request, Response, NextFunction } from "express";
import * as PaymentService from "./payments.service.js";

const notFound = (res: Response, err: Error) => {
  if (err.message === "Pagamento não encontrado") {
    res.status(404).json({ error: err.message });
    return true;
  }
  return false;
};

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await PaymentService.listPayments(req.query as Record<string, string>));
  } catch (err) { next(err); }
}

export async function summary(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await PaymentService.getPaymentSummary());
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await PaymentService.getPayment(parseInt(req.params.id, 10)));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await PaymentService.createPayment(req.body, req.user?.userId));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await PaymentService.updatePayment(parseInt(req.params.id, 10), req.body, req.user?.userId));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function recordPayment(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await PaymentService.recordPayment(parseInt(req.params.id, 10), req.body, req.user?.userId));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await PaymentService.deletePayment(parseInt(req.params.id, 10), req.user?.userId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}
