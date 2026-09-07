import { Router, Request, Response } from 'express';
const router = Router();
router.get('/error', (req: Request, res: Response) => {
  res.status(500).json({ status: 'error', message: 'An error occurred', stack: '', data: null });
});
export { router as errorRouter };
