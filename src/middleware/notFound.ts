import { Request, Response } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ status: 'error', message: `Cannot ${req.method} ${req.path}`, data: null, timestamp: new Date().toISOString() });
}
