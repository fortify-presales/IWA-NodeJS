import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  const user = req.user as any;
  const roles = (user.authorities ?? []).map((a: any) => a.name);
  if (!roles.includes('ROLE_ADMIN')) {
    return res.redirect('/app/admin');
  }
  next();
}
