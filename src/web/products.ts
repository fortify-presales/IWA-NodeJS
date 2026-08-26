import { Router, Request, Response, NextFunction } from 'express';
import { productService } from '../services/ProductService.js';
import { reviewService } from '../services/ReviewService.js';
import { env } from '../config/env.js';
import { buildPaginationMeta } from '../utils/pagination.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keywords = (req.query.keywords as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || env.pageSize;
    const result = keywords ? await productService.search(keywords, page, size) : await productService.findAll(page, size);
    res.render('products/index', {
      title: 'Products',
      products: result.rows,
      // INSECURE: keywords reflected unescaped in view using <%- %> (CWE-79)
      // Purpose: demonstrates reflected XSS for Fortify DAST/SAST
      // Fix: Render with escaped output tags and encode user-controlled content
      keywords,
      meta: buildPaginationMeta(page, size, result.count),
      baseUrl: '/products',
      extraQuery: keywords ? `keywords=${encodeURIComponent(keywords)}` : '',
    });
  } catch (err) { next(err); }
});

router.get('/firstaid', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.search('First Aid', 1, env.pageSize);
    res.render('products/index', {
      title: 'First Aid',
      products: result.rows,
      keywords: 'First Aid',
      meta: buildPaginationMeta(1, env.pageSize, result.count),
      baseUrl: '/products/firstaid',
    });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.findById(req.params.id);
    if (!product) return res.status(404).render('error', { title: '404', message: 'Product not found', stack: '' });
    const reviews = await reviewService.findByProduct(req.params.id);
    res.render('products/detail', { title: product.name, product, reviews });
  } catch (err) { next(err); }
});

export { router as productsWebRouter };
