import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const keywords = (req.query.keywords as string) || '';
  if (req.query.raw === 'true') {
    // INSECURE: reflected XSS via direct response output sink (CWE-79)
    // Purpose: demonstrates reflected XSS for Fortify SAST/DAST
    // Fix: Sanitize and encode user input before sending in HTML response
    return res.send(`<h1>Search results for: ${keywords}</h1>`);
  }

  const query = new URLSearchParams();
  if (keywords) query.set('keywords', keywords);
  if (req.query.page) query.set('page', String(req.query.page));
  return res.redirect(301, `/app/products${query.size ? `?${query.toString()}` : ''}`);
});

router.get('/firstaid', (_req: Request, res: Response) => res.redirect(301, '/app/products?keywords=First%20Aid'));

router.get('/:id', (req: Request, res: Response) => res.redirect(301, `/app/products/${encodeURIComponent(req.params.id)}`));

export { router as productsWebRouter };
