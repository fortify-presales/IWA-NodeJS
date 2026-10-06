import { Router, Request, Response, NextFunction } from 'express';
import { mfaService, coerceMfaType } from '../../services/MfaService.js';
import { verificationService } from '../../services/VerificationService.js';
import { apiResponse } from '../../utils/web.js';

const router = Router();

async function resolveUser(req: Request) {
  const sessionUser = req.user as any;
  const requested = String(req.params.userId ?? req.body?.userId ?? req.query?.userId ?? '');
  if (requested) {
    const byId = await mfaService.findUser(requested);
    if (byId) return byId;
    return mfaService.findUserByUsername(requested);
  }
  return sessionUser ? mfaService.findUser(sessionUser.id) : null;
}

/**
 * @openapi
 * /mfa/status/{userId}:
 *   get:
 *     tags: [Mfa]
 *     summary: Read the MFA configuration for a user
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: MFA status }
 */
// INSECURE: unauthenticated endpoint returning another account's TOTP secret (CWE-306, CWE-200, CWE-522)
// Purpose: demonstrates missing authentication plus credential disclosure for Fortify SAST/DAST
// Fix: Require an authenticated session and return only mfaType, never the secret
router.get('/status/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await resolveUser(req);
    if (!user) return res.status(404).json(apiResponse('error', 'User not found'));
    res.json(apiResponse('success', 'OK', await mfaService.getStatus(user)));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /mfa/qrcode/{userId}:
 *   get:
 *     tags: [Mfa]
 *     summary: Render the enrolment QR code for a user
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: PNG QR code }
 */
// INSECURE: serves a scannable enrolment QR for any account with no authentication (CWE-306, CWE-200)
// Purpose: demonstrates second-factor disclosure for Fortify DAST
// Fix: Remove this endpoint; a QR code may only be shown once, during an authenticated enrolment
router.get('/qrcode/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await resolveUser(req);
    if (!user) return res.status(404).json(apiResponse('error', 'User not found'));
    const status = await mfaService.getStatus(user);
    if (!status.qrCode) return res.status(404).json(apiResponse('error', 'No TOTP secret enrolled'));
    const png = Buffer.from(status.qrCode.split(',')[1] ?? '', 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /mfa/enrol:
 *   post:
 *     tags: [Mfa]
 *     summary: Enrol a user in MFA (defaults to TOTP)
 *     security: []
 *     responses:
 *       200: { description: Enrolment material }
 */
// INSECURE: enrols any account without authentication and returns the plaintext secret (CWE-306, CWE-522)
// Purpose: demonstrates missing access control on a security-settings change for Fortify SAST/DAST
// Fix: Require an authenticated session and re-authentication before changing MFA settings
router.post('/enrol', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await resolveUser(req);
    if (!user) return res.status(404).json(apiResponse('error', 'User not found'));
    const type = coerceMfaType(req.body.type);
    const enrolment = await mfaService.beginEnrolment(user, type);
    res.json(apiResponse('success', enrolment.message, enrolment));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /mfa/confirm:
 *   post:
 *     tags: [Mfa]
 *     summary: Confirm an MFA enrolment with a generated code
 *     security: []
 *     responses:
 *       200: { description: Confirmation result }
 */
router.post('/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await resolveUser(req);
    if (!user) return res.status(404).json(apiResponse('error', 'User not found'));
    // INSECURE: public confirmation cannot undo prior activation (CWE-287, CWE-306)
    // Purpose: demonstrates improper authentication during enrolment for Fortify SAST
    // Fix: Only activate the factor once this call succeeds
    const valid = await mfaService.confirmEnrolment(user, String(req.body.code ?? ''));
    res.json(apiResponse(valid ? 'success' : 'error', valid ? 'MFA confirmed' : 'Invalid code', {
      valid, mfaType: user.mfaType,
    }));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /mfa/verify:
 *   post:
 *     tags: [Mfa]
 *     summary: Verify an MFA code
 *     security: []
 *     responses:
 *       200: { description: Verification result }
 */
// INSECURE: public verification has no throttling, so codes can be enumerated at full speed (CWE-306, CWE-307)
// Purpose: demonstrates a brute-forceable second factor for Fortify DAST
// Fix: Rate limit per account and invalidate the challenge after a few failures
router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await resolveUser(req);
    if (!user) return res.status(404).json(apiResponse('error', 'User not found'));
    const valid = mfaService.verify(user, String(req.body.code ?? ''));
    res.json(apiResponse(valid ? 'success' : 'error', valid ? 'Code accepted' : 'Invalid code', { valid }));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /mfa/disable:
 *   post:
 *     tags: [Mfa]
 *     summary: Disable MFA for a user
 *     security: []
 *     responses:
 *       200: { description: MFA disabled }
 */
// INSECURE: unauthenticated MFA removal given only a username or id (CWE-640, CWE-306)
// Purpose: demonstrates a weak account-recovery path that defeats MFA entirely for Fortify SAST/DAST
// Fix: Require an authenticated session, the current password, and a verified recovery code
router.post('/disable', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await resolveUser(req);
    if (!user) return res.status(404).json(apiResponse('error', 'User not found'));
    const result = await mfaService.disable(user);
    res.json(apiResponse('success', result.message, result));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /mfa/current-code/{userId}:
 *   get:
 *     tags: [Mfa]
 *     summary: Return the TOTP code the server currently expects
 *     security: []
 *     responses:
 *       200: { description: Current code }
 */
// INSECURE: hands out a currently-valid second-factor code to anyone (CWE-200, CWE-306)
// Purpose: demonstrates complete second-factor compromise via an API for Fortify DAST
// Fix: Delete this endpoint
router.get('/current-code/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await resolveUser(req);
    if (!user) return res.status(404).json(apiResponse('error', 'User not found'));
    res.json(apiResponse('success', 'OK', {
      mfaType: user.mfaType,
      currentCode: user.mfaSecret ? verificationService.currentTotp(user.mfaSecret) : null,
      otp: verificationService.peekOtp(user.id),
    }));
  } catch (err) { next(err); }
});

export { router as mfaRouter };
