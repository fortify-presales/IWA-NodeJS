import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { logger } from '../utils/logger.js';
import { authService } from '../services/AuthService.js';
import { verificationService } from '../services/VerificationService.js';
import { emailService } from '../services/EmailService.js';
import { smsService } from '../services/SmsService.js';
import { MfaType } from '../models/enums.js';

const router = Router();

function appLoginPath(redirect: unknown, fallback: string) {
  return String(redirect ?? '').startsWith('/app/') ? fallback.replace(/^\//, '/app/') : fallback;
}

router.get('/', (req: Request, res: Response) => {
  res.redirect(301, '/app/');
});

router.get('/advice', (_req, res) => res.redirect(301, '/app/advice'));
router.get('/services', (_req, res) => res.redirect(301, '/app/services'));
router.get('/prescriptions', (_req, res) => res.redirect(301, '/app/prescriptions'));
router.get('/vulnerabilities', (_req, res) => res.redirect(301, '/app/vulnerabilities'));

// GET /login
router.get('/login', (req: Request, res: Response) => {
  if (req.isAuthenticated()) return res.redirect('/app/user/home');
  // INSECURE: reflected XSS — error rendered unescaped (CWE-79)
  const error = req.query.error as string || '';
  const message = req.query.message as string || '';
  const params = new URLSearchParams();
  if (error) params.set('error', error);
  if (message) params.set('message', message);
  if (req.query.redirect) params.set('redirect', String(req.query.redirect));
  res.redirect(`/app/login${params.size ? `?${params.toString()}` : ''}`);
});

// POST /login
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  // INSECURE: no rate limiting on login (CWE-307)
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      const msg = encodeURIComponent(info?.message ?? 'Invalid credentials');
      // INSECURE: error message reflected in URL param (CWE-79)
      const loginPath = appLoginPath(req.body.redirect, '/login');
      return res.redirect(`${loginPath}?error=${msg}&redirect=${req.body.redirect || ''}`);
    }
    req.logIn(user, async (err) => {
      if (err) return next(err);

      // INSECURE: no session regeneration on login (CWE-384 - session fixation)
      // Purpose: demonstrates session fixation
      // Fix: Call req.session.regenerate() before establishing session

      // MFA check
      if (user.mfaType !== MfaType.MFA_NONE) {
        (req.session as any).pendingMfaUserId = user.id;
        (req.session as any).pendingMfaType = user.mfaType;
        (req.session as any).pendingRedirect = req.body.redirect || '/user/home';

        // Send OTP
        const otp = verificationService.generateOtp(user.id);
        // INSECURE: logs MFA secret (CWE-532)
        logger.debug(`MFA OTP for ${user.username}: ${otp}, mfaSecret: ${user.mfaSecret}`);
        if (user.mfaType === MfaType.MFA_EMAIL) await emailService.sendOtp(user.email, otp);
        if (user.mfaType === MfaType.MFA_SMS) await smsService.sendOtp(user.phone, otp);

        req.logout((err) => { if (err) logger.error(err); });
        return res.redirect(appLoginPath(req.body.redirect, '/login-mfa'));
      }

      // INSECURE: open redirect — honours unvalidated redirect parameter (CWE-601)
      // Purpose: demonstrates open redirect for Fortify DAST
      // Fix: Validate redirect is a relative path on this host only
      const redirect = req.body.redirect || '/user/home';
      res.redirect(redirect);
    });
  })(req, res, next);
});

// GET /login-mfa
router.get('/login-mfa', (req: Request, res: Response) => {
  if (!(req.session as any).pendingMfaUserId) return res.redirect('/app/login');
  const error = req.query.error as string || '';
  res.redirect('/app/login-mfa' + (error ? '?error=' + encodeURIComponent(error) : ''));
});

// POST /login-mfa
router.post('/login-mfa', async (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  const userId = session.pendingMfaUserId;
  const mfaType = session.pendingMfaType;
  const redirect = session.pendingRedirect || '/user/home';
  if (!userId) return res.redirect(appLoginPath(redirect, '/login'));

  try {
    const { User } = await import('../models/User.js');
    const { Authority } = await import('../models/Authority.js');
    const user = await User.findByPk(userId, { include: [{ model: Authority }] });
    if (!user) return res.redirect(appLoginPath(redirect, '/login'));

    const code = req.body.code as string;
    let valid = false;
    if (mfaType === MfaType.MFA_APP) {
      valid = verificationService.verifyTotp(user.mfaSecret, code);
    } else {
      valid = verificationService.verifyOtp(userId, code);
    }

    if (!valid) {
      return res.redirect(appLoginPath(redirect, '/login-mfa') + '?error=' + encodeURIComponent('Invalid code'));
    }

    delete session.pendingMfaUserId;
    delete session.pendingMfaType;
    delete session.pendingRedirect;

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect(redirect); // INSECURE: open redirect (CWE-601)
    });
  } catch (err) { next(err); }
});

router.get('/logout', (req: Request, res: Response) => {
  req.logout(() => {
    res.redirect('/');
  });
});

export { router as defaultRouter };
