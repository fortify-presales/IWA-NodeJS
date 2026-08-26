import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { apiResponse } from '../utils/web.js';

export function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(apiResponse('error', 'Unauthorized'));
    req.user = user;
    next();
  })(req, res, next);
}
