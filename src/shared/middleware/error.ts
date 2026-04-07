import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (err.name === "PrismaClientKnownRequestError") {
    res.status(409).json({ error: "Conflito de dados no banco de dados" });
    return;
  }

  if (err.name === "PrismaClientValidationError") {
    res.status(400).json({ error: "Dados inválidos para o banco de dados" });
    return;
  }

  res.status(500).json({ error: "Erro interno do servidor" });
}
