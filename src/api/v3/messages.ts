import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { messageService } from '../../services/MessageService.js';
import { apiResponse } from '../../utils/web.js';
import { env } from '../../config/env.js';

const router = Router();

router.get('/', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || env.pageSize;
    const result = await messageService.findAll(page, size);
    res.json(apiResponse('success', 'OK', result));
  } catch (err) { next(err); }
});

router.get('/unread-count/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await messageService.countUnread(req.params.id);
    res.json(apiResponse('success', 'OK', { count }));
  } catch (err) { next(err); }
});

router.get('/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await messageService.findById(req.params.id);
    if (!message) return res.status(404).json(apiResponse('error', 'Not found'));
    res.json(apiResponse('success', 'OK', message));
  } catch (err) { next(err); }
});

router.post('/', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await messageService.create(req.body);
    res.status(201).json(apiResponse('success', 'Created', message));
  } catch (err) { next(err); }
});

router.put('/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await messageService.update(req.params.id, req.body);
    const message = await messageService.findById(req.params.id);
    res.json(apiResponse('success', 'Updated', message));
  } catch (err) { next(err); }
});

router.delete('/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await messageService.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted'));
  } catch (err) { next(err); }
});

export { router as messagesRouter };
