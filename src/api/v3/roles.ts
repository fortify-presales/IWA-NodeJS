import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { requireRole } from '../../middleware/requireRole.js';
import { roleRepository } from '../../repositories/RoleRepository.js';
import { apiResponse } from '../../utils/web.js';

const router = Router();
router.use(authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'));

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(apiResponse('success', 'OK', await roleRepository.findAll()));
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleRepository.findById(req.params.id);
    if (!role) return res.status(404).json(apiResponse('error', 'Not found'));
    res.json(apiResponse('success', 'OK', role));
  } catch (err) { next(err); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(apiResponse('success', 'Created', await roleRepository.create(req.body)));
  } catch (err) { next(err); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await roleRepository.update(req.params.id, req.body);
    res.json(apiResponse('success', 'Updated', { updated: updated[0] }));
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await roleRepository.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted', { deleted }));
  } catch (err) { next(err); }
});

export { router as rolesRouter };
