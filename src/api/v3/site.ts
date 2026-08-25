import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import { userService } from '../../services/UserService.js';
import { authService } from '../../services/AuthService.js';
import { apiResponse } from '../../utils/web.js';
import { emailService } from '../../services/EmailService.js';

const router = Router();

/**
 * @openapi
 * /site/status:
 *   get:
 *     tags: [Site]
 *     summary: Application health status
 *     security: []
 *     responses:
 *       200:
 *         description: Application is running
 */
router.get('/status', (req, res) => {
  res.json(apiResponse('success', 'Application is running', { status: 'UP' }));
});

/**
 * @openapi
 * /site/username-already-exists/{username}:
 *   get:
 *     tags: [Site]
 *     summary: Check if username is taken
 *     security: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Availability result
 */
router.get('/username-already-exists/:username', async (req, res, next) => {
  try {
    const exists = await userService.usernameExists(req.params.username);
    res.json(apiResponse('success', 'OK', { exists }));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /site/email-already-exists/{email}:
 *   get:
 *     tags: [Site]
 *     summary: Check if email is taken
 *     security: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Availability result
 */
router.get('/email-already-exists/:email', async (req, res, next) => {
  try {
    const exists = await userService.emailExists(req.params.email);
    res.json(apiResponse('success', 'OK', { exists }));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /site/register-user:
 *   post:
 *     tags: [Site]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, firstName, lastName]
 *             properties:
 *               username: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Validation error
 *       409:
 *         description: Username or email already exists
 */
router.post('/register-user',
  body('username').notEmpty().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(apiResponse('error', 'Validation failed', errors.array()));
    try {
      const { user } = await userService.register(req.body);
      await emailService.sendVerification(user.email, `verify-${user.id}`);
      res.status(201).json(apiResponse('success', 'User registered', { id: user.id, username: user.username }));
    } catch (err: any) {
      if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json(apiResponse('error', 'Username or email already exists'));
      next(err);
    }
  }
);

/**
 * @openapi
 * /site/subscribe-user:
 *   post:
 *     tags: [Site]
 *     summary: Subscribe an email address to the newsletter
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Subscribed successfully
 */
router.post('/subscribe-user', async (req: Request, res: Response) => {
  const email = String(req.body.email ?? 'subscriber@iwa.local');
  await emailService.sendEmail(email, 'Subscription confirmed', '<p>Thanks for subscribing.</p>');
  res.json(apiResponse('success', 'Subscribed successfully', { email }));
});

/**
 * @openapi
 * /site/sign-in:
 *   post:
 *     tags: [Site]
 *     summary: Authenticate and receive a JWT token pair
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful — returns token and refreshToken
 *       401:
 *         description: Invalid credentials
 */
router.post('/sign-in', (req: Request, res: Response, next: NextFunction) => {
  // INSECURE: no rate limiting (CWE-307)
  passport.authenticate('local', { session: false }, async (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(apiResponse('error', info?.message ?? 'Invalid credentials'));
    try {
      const { token, refreshToken } = await authService.generateTokenPair(user);
      const roles = (user.authorities ?? []).map((a: any) => a.name);
      const redirect = String(req.body.redirect ?? req.query.redirect ?? '');
      if (redirect) {
        // INSECURE: open redirect - honors unvalidated redirect param (CWE-601)
        // Purpose: demonstrates unvalidated redirects for Fortify DAST/SAST
        // Fix: Only allow relative paths or a strict allowlist of destinations
        return res.redirect(redirect);
      }
      res.json(apiResponse('success', 'Login successful', {
        token, refreshToken, type: 'Bearer',
        id: user.id, username: user.username, roles,
      }));
    } catch (err) { next(err); }
  })(req, res, next);
});

/**
 * @openapi
 * /site/sign-out:
 *   post:
 *     tags: [Site]
 *     summary: Revoke refresh token and sign out
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Signed out
 */
router.post('/sign-out', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await authService.revokeRefreshToken(refreshToken);
    res.json(apiResponse('success', 'Signed out'));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /site/refresh-token:
 *   post:
 *     tags: [Site]
 *     summary: Obtain a new access token using a refresh token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json(apiResponse('error', 'Refresh token required'));
    const { token } = await authService.refreshToken(refreshToken);
    res.json(apiResponse('success', 'Token refreshed', { token }));
  } catch (err: any) {
    res.status(401).json(apiResponse('error', err.message));
  }
});

export default router;
export { router as siteRouter };
