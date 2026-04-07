import { Request, Response, NextFunction } from "express";
import * as AuditService from "./audit.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AuditService.listAuditLogs(req.query as Record<string, string>);
    res.json(result);
  } catch (err) { next(err); }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await AuditService.getAuditStats();
    res.json(data);
  } catch (err) { next(err); }
}
