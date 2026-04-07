import { Request, Response, NextFunction } from "express";
import * as AuthService from "./auth.service.js";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "Usuário ou senha inválidos") {
      res.status(401).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    await AuthService.changePassword(req.user!.userId, req.body);
    res.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    if (err instanceof Error && err.message === "Senha atual incorreta") {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.me(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
