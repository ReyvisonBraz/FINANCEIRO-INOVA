import { Request, Response, NextFunction } from "express";
import * as TransactionService from "./transactions.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await TransactionService.listTransactions(req.query as Record<string, string>);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const transaction = await TransactionService.getTransaction(parseInt(req.params.id, 10));
    res.json(transaction);
  } catch (err) {
    if (err instanceof Error && err.message === "Transação não encontrada") {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const transaction = await TransactionService.createTransaction(req.body, req.user?.userId);
    res.status(201).json(transaction);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const transaction = await TransactionService.updateTransaction(
      parseInt(req.params.id, 10),
      req.body,
      req.user?.userId
    );
    res.json(transaction);
  } catch (err) {
    if (err instanceof Error && err.message === "Transação não encontrada") {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await TransactionService.deleteTransaction(parseInt(req.params.id, 10), req.user?.userId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message === "Transação não encontrada") {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function summary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await TransactionService.getSummary();
    res.json(data);
  } catch (err) { next(err); }
}
