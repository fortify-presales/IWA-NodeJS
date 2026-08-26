import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { requireRole } from '../../middleware/requireRole.js';
import { userService } from '../../services/UserService.js';
import { apiResponse } from '../../utils/web.js';
import { env } from '../../config/env.js';

const router = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List or search users
 *     parameters:
 *       - in: query
 *         name: keywords
 *         schema: { type: string }
 *         description: Search keywords (INSECURE — SQL injection CWE-89)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 25 }
 *     responses:
 *       200:
 *         description: User list
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateJwt, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) return res.status(404).json(apiResponse('error', 'User not found'));
    res.json(apiResponse('success', 'OK', user));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = await userService.register(req.body);
    res.status(201).json(apiResponse('success', 'Created', user));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update a user (INSECURE — unauthenticated, mass-assignment CWE-306/CWE-915)
 *     security: []
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
 *         description: User updated
 */
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

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/:id', authenticateJwt, requireRole('ROLE_ADMIN', 'ROLE_API'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.delete(req.params.id);
    res.json(apiResponse('success', 'Deleted'));
  } catch (err) { next(err); }
});

export { router as usersRouter };
