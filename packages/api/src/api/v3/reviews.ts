import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { requireRole } from '../../middleware/requireRole.js';
import { reviewService } from '../../services/ReviewService.js';
import { apiResponse } from '../../utils/web.js';
import { env } from '../../config/env.js';

const router = Router();

/**
 * @openapi
 * /reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List all reviews
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 25 }
 *     responses:
 *       200:
 *         description: Review list
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || env.pageSize;
    const productId = String(req.query.productId ?? req.query.pid ?? '');
    if (productId) {
      const reviews = await reviewService.findByProduct(productId);
      return res.json(apiResponse('success', 'OK', reviews));
    }
    const result = await reviewService.findAll(page, size);
    res.json(apiResponse('success', 'OK', result));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get a review by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.findById(req.params.id);
    if (!review) return res.status(404).json(apiResponse('error', 'Not found'));
    res.json(apiResponse('success', 'OK', review));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Submit a product review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, comment, rating]
 *             properties:
 *               productId: { type: integer }
 *               comment: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *     responses:
 *       201:
 *         description: Review created
 */
router.post('/', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.create(req.body);
    res.status(201).json(apiResponse('success', 'Created', review));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     summary: Update a review (admin only)
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
 *         description: Review updated
 */
router.put('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reviewService.update(req.params.id, req.body);
    const review = await reviewService.findById(req.params.id);
    res.json(apiResponse('success', 'Updated', review));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reviewService.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted'));
  } catch (err) { next(err); }
});

export { router as reviewsRouter };
