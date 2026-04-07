import { Request, Response, NextFunction } from "express";
import * as CustomerService from "./customers.service.js";

const notFound = (res: Response, err: Error) => {
  if (err.message === "Cliente não encontrado") {
    res.status(404).json({ error: err.message });
    return true;
  }
  return false;
};

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await CustomerService.listCustomers(req.query as Record<string, string>));
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await CustomerService.getCustomer(parseInt(req.params.id, 10)));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function checkDuplicates(req: Request, res: Response, next: NextFunction) {
  try {
    const { cpf, phone } = req.query as Record<string, string>;
    const duplicates = await CustomerService.findDuplicates(cpf, phone);
    res.json({ duplicates, hasDuplicates: duplicates.length > 0 });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await CustomerService.createCustomer(req.body, req.user?.userId));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await CustomerService.updateCustomer(parseInt(req.params.id, 10), req.body, req.user?.userId));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await CustomerService.deleteCustomer(parseInt(req.params.id, 10), req.user?.userId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}
