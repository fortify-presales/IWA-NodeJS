import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { requireRole } from '../../middleware/requireRole.js';
import { productService } from '../../services/ProductService.js';
import { apiResponse } from '../../utils/web.js';
import { buildPaginationMeta } from '../../utils/pagination.js';

const router = Router();

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

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.findById(req.params.id);
    if (!product) return res.status(404).json(apiResponse('error', 'Not found'));
    res.json(apiResponse('success', 'OK', product));
  } catch (err) { next(err); }
});

router.get('/:id/image', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.findById(req.params.id);
    if (!product?.image) return res.status(404).json(apiResponse('error', 'No image'));
    res.redirect(product.image);
  } catch (err) { next(err); }
});

router.post('/', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(apiResponse('success', 'Created', product));
  } catch (err) { next(err); }
});

router.put('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.update(req.params.id, req.body);
    res.json(apiResponse('success', 'Updated', await productService.findById(req.params.id)));
  } catch (err) { next(err); }
});

router.delete('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted'));
  } catch (err) { next(err); }
});

export { router as productsRouter };
