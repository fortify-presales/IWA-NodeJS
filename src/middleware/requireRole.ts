import { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../utils/web.js';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) return res.status(401).json(apiResponse('error', 'Unauthorized'));
    const userRoles = (user.authorities ?? []).map((a: any) => a.name);
    if (!roles.some(r => userRoles.includes(r))) return res.status(403).json(apiResponse('error', 'Forbidden'));
    next();
  };
}
