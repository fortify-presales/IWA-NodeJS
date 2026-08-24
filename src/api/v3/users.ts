import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { requireRole } from '../../middleware/requireRole.js';
import { userService } from '../../services/UserService.js';
import { apiResponse } from '../../utils/web.js';
import { env } from '../../config/env.js';

const router = Router();

router.get('/', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keywords = req.query.keywords as string;
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || env.pageSize;
    if (keywords) {
      // INSECURE: passes keywords directly to SQL concatenation (CWE-89)
      const users = await userService.search(keywords);
      return res.json(apiResponse('success', 'OK', users));
    }
    const result = await userService.findAll(page, size);
    res.json(apiResponse('success', 'OK', result));
  } catch (err) { next(err); }
});

router.get('/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) return res.status(404).json(apiResponse('error', 'User not found'));
    res.json(apiResponse('success', 'OK', user));
  } catch (err) { next(err); }
});

router.post('/', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = await userService.register(req.body);
    res.status(201).json(apiResponse('success', 'Created', user));
  } catch (err) { next(err); }
});

// INSECURE: intentionally unauthenticated PUT — broken access control (CWE-306, CWE-639)
// INSECURE: mass assignment — passes req.body directly to update (CWE-915)
// Purpose: demonstrates broken object level authorization and mass assignment for Fortify DAST
// Fix: Require authentication; check ownership; use field allowlist
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.updateInsecure(req.params.id, req.body);
    const user = await userService.findById(req.params.id);
    res.json(apiResponse('success', 'Updated', user));
  } catch (err) { next(err); }
});

router.delete('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted'));
  } catch (err) { next(err); }
});

export { router as usersRouter };
