import { Request, Response, NextFunction } from "express";
import * as UserService from "./users.service.js";

const notFound = (res: Response, err: Error) => {
  if (err.message === "Usuário não encontrado") {
    res.status(404).json({ error: err.message });
    return true;
  }
  return false;
};

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await UserService.listUsers(req.query as Record<string, string>));
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await UserService.getUser(parseInt(req.params.id, 10)));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await UserService.createUser(req.body, req.user?.userId));
  } catch (err) {
    if (err instanceof Error && err.message === "Username já está em uso") {
      res.status(409).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await UserService.updateUser(parseInt(req.params.id, 10), req.body, req.user?.userId));
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await UserService.resetPassword(parseInt(req.params.id, 10), req.body, req.user?.userId);
    res.json({ message: "Senha redefinida com sucesso" });
  } catch (err) {
    if (err instanceof Error && notFound(res, err)) return;
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await UserService.deleteUser(parseInt(req.params.id, 10), req.user?.userId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error) {
      if (notFound(res, err)) return;
      if (err.message === "Não é possível remover a própria conta") {
        res.status(400).json({ error: err.message });
        return;
      }
    }
    next(err);
  }
}
