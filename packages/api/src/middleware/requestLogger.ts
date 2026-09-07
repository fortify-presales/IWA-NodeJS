import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  logger.debug(`${req.method} ${req.originalUrl}`);
  next();
}
