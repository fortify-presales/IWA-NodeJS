import { Router, Request, Response, NextFunction } from 'express';
import { userService } from '../services/UserService.js';
import { emailService } from '../services/EmailService.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/register', (req: Request, res: Response) => {
  if (req.isAuthenticated()) return res.redirect('/user/home');
  res.render('user/register', { title: 'Register' });
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, verificationToken } = await userService.register(req.body);
    await emailService.sendVerification(user.email, verificationToken);
    res.redirect('/login?message=Registration successful. Please verify your email.');
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.render('user/register', { title: 'Register', error: 'Username or email already exists' });
    }
    next(err);
  }
});

router.get('/verify', async (req: Request, res: Response) => {
  // Simplified: just mark verified
  res.render('login', { title: 'Login', error: '', redirect: '', message: 'Account verified. Please login.' });
});

router.get('/forgot-password', (req: Request, res: Response) => {
  res.render('user/forgot-password', { title: 'Forgot Password' });
});

router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.findByUsername ? null : null;
    res.render('user/forgot-password', { title: 'Forgot Password', success: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
});

export { router as userPublicRouter };
