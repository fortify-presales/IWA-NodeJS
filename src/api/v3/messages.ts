import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { messageService } from '../../services/MessageService.js';
import { apiResponse } from '../../utils/web.js';
import { env } from '../../config/env.js';

const router = Router();

/**
 * @openapi
 * /messages:
 *   get:
 *     tags: [Messages]
 *     summary: List all messages
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 25 }
 *     responses:
 *       200:
 *         description: Message list
 */
router.get('/', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || env.pageSize;
    const result = await messageService.findAll(page, size);
    res.json(apiResponse('success', 'OK', result));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /messages/unread-count/{id}:
 *   get:
 *     tags: [Messages]
 *     summary: Get unread message count for a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread-count/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await messageService.countUnread(req.params.id);
    res.json(apiResponse('success', 'OK', { count }));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /messages/{id}:
 *   get:
 *     tags: [Messages]
 *     summary: Get a message by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message found
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await messageService.findById(req.params.id);
    if (!message) return res.status(404).json(apiResponse('error', 'Not found'));
    res.json(apiResponse('success', 'OK', message));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /messages:
 *   post:
 *     tags: [Messages]
 *     summary: Create a new message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Message created
 */
router.post('/', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await messageService.create(req.body);
    res.status(201).json(apiResponse('success', 'Created', message));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /messages/{id}:
 *   put:
 *     tags: [Messages]
 *     summary: Update a message
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Message updated
 */
router.put('/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await messageService.update(req.params.id, req.body);
    const message = await messageService.findById(req.params.id);
    res.json(apiResponse('success', 'Updated', message));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /messages/{id}:
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a message
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete('/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await messageService.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted'));
  } catch (err) { next(err); }
});

export { router as messagesRouter };
