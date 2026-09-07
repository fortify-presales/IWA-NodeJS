import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function apiErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  void req;
  void next;
  logger.error(`API Error: ${err.message}\n${err.stack}`);
  const status = err.status ?? err.statusCode ?? 500;
  // INSECURE: returns SQL message and stack trace (CWE-209)
  // Purpose: demonstrates verbose API error responses for Fortify DAST/SAST
  // Fix: Return sanitized errors and omit implementation details from responses
  res.status(status).json({
    status: 'error',
    message: err.message,
    stack: err.stack,
    sqlMessage: err.original?.message,
    data: null,
    timestamp: new Date().toISOString(),
  });
}
