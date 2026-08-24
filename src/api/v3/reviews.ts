import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { requireRole } from '../../middleware/requireRole.js';
import { reviewService } from '../../services/ReviewService.js';
import { apiResponse } from '../../utils/web.js';
import { env } from '../../config/env.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || env.pageSize;
    const result = await reviewService.findAll(page, size);
    res.json(apiResponse('success', 'OK', result));
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.findById(req.params.id);
    if (!review) return res.status(404).json(apiResponse('error', 'Not found'));
    res.json(apiResponse('success', 'OK', review));
  } catch (err) { next(err); }
});

router.post('/', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.create(req.body);
    res.status(201).json(apiResponse('success', 'Created', review));
  } catch (err) { next(err); }
});

router.put('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reviewService.update(req.params.id, req.body);
    const review = await reviewService.findById(req.params.id);
    res.json(apiResponse('success', 'Updated', review));
  } catch (err) { next(err); }
});

router.delete('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reviewService.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted'));
  } catch (err) { next(err); }
});

export { router as reviewsRouter };
