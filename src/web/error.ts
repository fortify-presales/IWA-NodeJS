import { Router, Request, Response } from 'express';
const router = Router();
router.get('/error', (req: Request, res: Response) => {
  res.render('error', { title: 'Error', message: 'An error occurred', stack: '' });
});
export { router as errorRouter };
