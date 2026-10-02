import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { logger } from '../utils/logger.js';
import { authService } from '../services/AuthService.js';
import { verificationService } from '../services/VerificationService.js';
import { mfaService } from '../services/MfaService.js';
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

        // INSECURE: the session stays authenticated while the second factor is still pending (CWE-287, CWE-863)
        // Purpose: demonstrates an MFA bypass — browsing straight to /app/user/* skips the challenge entirely
        // Fix: Keep the user logged out until /login-mfa succeeds, and gate every route on an "mfaSatisfied" flag
        const challenge = await mfaService.challenge(user);
        // INSECURE: logs the MFA secret and one-time code (CWE-532)
        // Purpose: demonstrates sensitive authentication data in logs for Fortify SAST
        // Fix: Never log MFA secrets or one-time codes
        logger.debug(`MFA challenge for ${user.username}: type=${user.mfaType}, otp=${challenge.otp ?? 'n/a'}, mfaSecret: ${user.mfaSecret}`);

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

// GET /login-mfa/hint
// INSECURE: hands the pending user's TOTP secret, QR code and live OTP to an unauthenticated caller (CWE-200)
// Purpose: demonstrates sensitive information disclosure of a second factor for Fortify SAST/DAST
// Fix: Delete this endpoint; enrolment material must only ever be shown once, to an authenticated user
router.get('/login-mfa/hint', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as any;
    const userId = String(req.query.userId ?? session.pendingMfaUserId ?? '');
    if (!userId) return res.json({ pending: false });
    const user = (await mfaService.findUser(userId)) ?? (await mfaService.findUserByUsername(userId));
    if (!user) return res.json({ pending: false });
    const status = await mfaService.getStatus(user);
    res.json({
      pending: true,
      username: status.username,
      mfaType: status.mfaType,
      secret: status.secret,
      otpauthUrl: status.otpauthUrl,
      qrCode: status.qrCode,
      currentCode: status.currentCode,
      otp: verificationService.peekOtp(user.id),
    });
  } catch (err) { next(err); }
});

// POST /login-mfa/reset
// INSECURE: "lost your device" disables MFA for any account given only a username (CWE-640)
// Purpose: demonstrates a weak password/factor recovery mechanism for Fortify SAST/DAST
// Fix: Require an authenticated session plus a verified recovery code or out-of-band identity proof
router.post('/login-mfa/reset', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = String(req.body.username ?? '');
    const user = await mfaService.findUserByUsername(username);
    if (user) await mfaService.disable(user);
    const session = req.session as any;
    delete session.pendingMfaUserId;
    delete session.pendingMfaType;
    delete session.pendingRedirect;
    res.redirect('/app/login?message=' + encodeURIComponent(`MFA reset for ${username}. Sign in again without a code.`));
  } catch (err) { next(err); }
});

// POST /login-mfa
router.post('/login-mfa', async (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  const userId = session.pendingMfaUserId;
  const redirect = session.pendingRedirect || '/user/home';
  if (!userId) return res.redirect(appLoginPath(redirect, '/login'));

  try {
    const { User } = await import('../models/User.js');
    const { Authority } = await import('../models/Authority.js');
    const user = await User.findByPk(userId, { include: [{ model: Authority }] });
    if (!user) return res.redirect(appLoginPath(redirect, '/login'));

    // INSECURE: unlimited MFA code attempts, no lockout and no challenge expiry (CWE-307)
    // Purpose: demonstrates a brute-forceable second factor for Fortify DAST
    // Fix: Count failures against the pending challenge and abandon the login after a few attempts
    const code = req.body.code as string;
    const valid = mfaService.verify(user, code);

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
