import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { requireRole } from '../../middleware/requireRole.js';
import { orderService } from '../../services/OrderService.js';
import { apiResponse } from '../../utils/web.js';
import { env } from '../../config/env.js';

const router = Router();

router.get('/', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || env.pageSize;
    const result = await orderService.findAll(page, size);
    res.json(apiResponse('success', 'OK', result));
  } catch (err) { next(err); }
});

// INSECURE: no ownership check (CWE-639)
router.get('/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.findById(req.params.id);
    if (!order) return res.status(404).json(apiResponse('error', 'Not found'));
    res.json(apiResponse('success', 'OK', order));
  } catch (err) { next(err); }
});

router.post('/', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.create(req.body);
    res.status(201).json(apiResponse('success', 'Created', order));
  } catch (err) { next(err); }
});

router.put('/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orderService.update(req.params.id, req.body);
    const order = await orderService.findById(req.params.id);
    res.json(apiResponse('success', 'Updated', order));
  } catch (err) { next(err); }
});

router.delete('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orderService.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted'));
  } catch (err) { next(err); }
});

export { router as ordersRouter };
