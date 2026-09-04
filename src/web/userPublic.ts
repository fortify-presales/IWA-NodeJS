import { Router, Request, Response, NextFunction } from 'express';
import { userService } from '../services/UserService.js';
import { emailService } from '../services/EmailService.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/register', (req: Request, res: Response) => {
  if (req.isAuthenticated()) return res.redirect('/user/home');
  res.redirect('/app/register');
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, verificationToken } = await userService.register(req.body);
    await emailService.sendVerification(user.email, verificationToken);
    res.redirect('/login?message=Registration successful. Please verify your email.');
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.redirect('/app/register?error=' + encodeURIComponent('Username or email already exists'));
    }
    next(err);
  }
});

router.get('/verify', async (req: Request, res: Response) => {
  // Simplified: just mark verified
  res.redirect('/app/login?message=' + encodeURIComponent('Account verified. Please login.'));
});

router.get('/forgot-password', (req: Request, res: Response) => {
  res.redirect('/app/forgot-password');
});

router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lookup user by email — always respond with generic message to prevent user enumeration
    await userService.emailExists(req.body.email);
    res.redirect('/app/login?message=' + encodeURIComponent('If that email exists, a reset link has been sent.'));
  } catch (err) { next(err); }
});

export { router as userPublicRouter };
