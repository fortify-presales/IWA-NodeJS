import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// INSECURE: exposes stack traces and SQL errors to client (CWE-209)
// Purpose: demonstrates verbose error handling for Fortify DAST
// Fix: Return generic messages; log full details server-side only
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error(`Error: ${err.message}\n${err.stack}`);
  const status = err.status ?? err.statusCode ?? 500;
  if (req.xhr || req.headers.accept?.includes('application/json') || req.path.startsWith('/api')) {
    return res.status(status).json({
      status: 'error',
      message: err.message,
      stack: err.stack,  // INSECURE: stack trace in response (CWE-209)
      sqlMessage: err.original?.message,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }
  res.status(status).render('error', { title: 'Error', message: err.message, stack: err.stack, layout: 'layouts/main' });
}
