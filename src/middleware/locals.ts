import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export function locals(req: Request, res: Response, next: NextFunction) {
  res.locals.user = req.user ?? null;
  res.locals.appName = env.appName;
  res.locals.appVersion = env.appVersion;
  res.locals.currency = env.appCurrency;
  const sess = req.session as any;
  res.locals.flash = { success: sess.flashSuccess, error: sess.flashError };
  delete sess.flashSuccess;
  delete sess.flashError;
  next();
}
