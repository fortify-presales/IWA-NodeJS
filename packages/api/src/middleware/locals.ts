import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export function locals(req: Request, res: Response, next: NextFunction) {
  res.locals.user = req.user ?? null;
  res.locals.appName = env.appName;
  res.locals.appVersion = env.appVersion;
  res.locals.currency = env.appCurrency;
  const sess = req.session as any;
  const cart = Array.isArray(sess.cart) ? sess.cart : [];
  res.locals.cartCount = cart.reduce((sum: number, item: any) => sum + (parseInt(String(item.qty), 10) || 0), 0);
  res.locals.flash = { success: sess.flashSuccess, error: sess.flashError };
  delete sess.flashSuccess;
  delete sess.flashError;
  next();
}
