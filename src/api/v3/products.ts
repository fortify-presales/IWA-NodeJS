import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { requireRole } from '../../middleware/requireRole.js';
import { productService } from '../../services/ProductService.js';
import { apiResponse } from '../../utils/web.js';
import { buildPaginationMeta } from '../../utils/pagination.js';

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List or search products
 *     security: []
 *     parameters:
 *       - in: query
 *         name: keywords
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 25 }
 *     responses:
 *       200:
 *         description: Product list with pagination metadata
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 25;
    const keywords = req.query.keywords;
    if (keywords && typeof keywords !== 'string') {
      // INSECURE: spreads raw query params into ORM search object (CWE-943)
      // Purpose: demonstrates query object injection for Fortify DAST/SAST
      // Fix: Explicitly map allowlisted query params to safe ORM filters
      const rows = await productService.searchInsecure(req.query as Record<string, any>);
      return res.json(apiResponse('success', 'OK', { rows, meta: buildPaginationMeta(page, size, rows.length) }));
    }
    if (typeof keywords === 'string' && keywords.trim()) {
      const result = await productService.search(keywords, page, size);
      return res.json(apiResponse('success', 'OK', { rows: result.rows, meta: buildPaginationMeta(page, size, result.count) }));
    }
    const result = await productService.findAll(page, size);
    res.json(apiResponse('success', 'OK', { rows: result.rows, meta: buildPaginationMeta(page, size, result.count) }));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.findById(req.params.id);
    if (!product) return res.status(404).json(apiResponse('error', 'Not found'));
    res.json(apiResponse('success', 'OK', product));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /products/{id}/image:
 *   get:
 *     tags: [Products]
 *     summary: Redirect to product image
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       302:
 *         description: Redirect to image URL
 *       404:
 *         description: No image
 */
router.get('/:id/image', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.findById(req.params.id);
    if (!product?.image) return res.status(404).json(apiResponse('error', 'No image'));
    res.redirect(product.image);
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(apiResponse('success', 'Created', product));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product (admin only)
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
 *         description: Product updated
 */
router.put('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.update(req.params.id, req.body);
    res.json(apiResponse('success', 'Updated', await productService.findById(req.params.id)));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted'));
  } catch (err) { next(err); }
});

export { router as productsRouter };
