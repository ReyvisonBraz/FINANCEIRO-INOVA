import { Request, Response, NextFunction } from "express";
import * as SettingsService from "./settings.service.js";

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await SettingsService.getSettings();
    res.json(settings);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await SettingsService.updateSettings(req.body, req.user?.userId);
    res.json(settings);
  } catch (err) { next(err); }
}
