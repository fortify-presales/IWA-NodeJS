import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { requireRole } from '../../middleware/requireRole.js';
import { roleRepository } from '../../repositories/RoleRepository.js';
import { apiResponse } from '../../utils/web.js';

const router = Router();
router.use(authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'));

/**
 * @openapi
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: List all roles (admin only)
 *     responses:
 *       200:
 *         description: Role list
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(apiResponse('success', 'OK', await roleRepository.findAll()));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get a role by ID (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Role found
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleRepository.findById(req.params.id);
    if (!role) return res.status(404).json(apiResponse('error', 'Not found'));
    res.json(apiResponse('success', 'OK', role));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create a role (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Role created
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(apiResponse('success', 'Created', await roleRepository.create(req.body)));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Update a role (admin only)
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
 *         description: Role updated
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await roleRepository.update(req.params.id, req.body);
    res.json(apiResponse('success', 'Updated', { updated: updated[0] }));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete a role (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Role deleted
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await roleRepository.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted', { deleted }));
  } catch (err) { next(err); }
});

export { router as rolesRouter };
