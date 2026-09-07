import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import libxmljs from 'libxmljs2';
import serialize from 'node-serialize';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { userService } from '../services/UserService.js';
import { orderService } from '../services/OrderService.js';
import { storageService } from '../services/StorageService.js';
import { pdfService } from '../services/PdfService.js';
import { verificationService } from '../services/VerificationService.js';
import { emailService } from '../services/EmailService.js';
import { smsService } from '../services/SmsService.js';
import { MfaType } from '../models/enums.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

function getAppReturnTo(req: Request, fallback: string) {
  const returnTo = String(req.body.appReturnTo ?? '');
  return returnTo.startsWith('/app/user/') || returnTo === '/app/login' ? returnTo : fallback;
}

function setReactResult(req: Request, result: Record<string, unknown>) {
  (req.session as any).reactResult = result;
}

router.get('/register', (_req: Request, res: Response) => {
  res.redirect(301, '/app/register');
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, verificationToken } = await userService.register(req.body);
    (req.session as any).pendingVerificationUserId = user.id;
    (req.session as any).pendingVerificationToken = verificationToken;
    await emailService.sendVerification(user.email, verificationToken);
    (req.session as any).flashSuccess = `Registration successful. Demo verification token: ${verificationToken}`;
    if (req.body.appReturnTo === '/app/login') {
      return res.redirect('/app/login?message=' + encodeURIComponent(`Registration successful. Demo verification token: ${verificationToken}`));
    }
    res.redirect('/login');
  } catch (err) { next(err); }
});

router.get('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = String(req.query.token ?? '');
    const session = req.session as any;
    if (token && session.pendingVerificationToken && token === session.pendingVerificationToken && session.pendingVerificationUserId) {
      const user = await User.findByPk(session.pendingVerificationUserId);
      if (user) {
        user.verified = true;
        await user.save();
      }
    }
    delete session.pendingVerificationUserId;
    delete session.pendingVerificationToken;
    session.flashSuccess = 'Account verification complete';
    res.redirect('/login');
  } catch (err) { next(err); }
});

router.get('/forgot-password', (_req: Request, res: Response) => {
  res.redirect(301, '/app/forgot-password');
});

router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      const token = verificationService.generatePasswordResetToken();
      await emailService.sendPasswordReset(user.email, token);
      (req.session as any).flashSuccess = `Password reset requested. Demo token: ${token}`;
    }
    if (req.body.appReturnTo === '/app/login') {
      return res.redirect('/app/login?message=' + encodeURIComponent('Password reset requested. Check demo logs for token.'));
    }
    res.redirect('/login');
  } catch (err) { next(err); }
});

router.use(requireAuth);

router.get('/home', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.redirect(301, '/app/user/home');
  } catch (err) { next(err); }
});

router.get('/profile', (req: Request, res: Response) => {
  res.redirect(301, '/app/user/profile');
});

router.get('/edit-profile', (req: Request, res: Response) => {
  res.redirect(301, '/app/user/edit-profile');
});

router.post('/edit-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    await userService.update(user.id, req.body);
    (req.session as any).flashSuccess = 'Profile updated';
    res.redirect(getAppReturnTo(req, '/user/profile'));
  } catch (err) { next(err); }
});

router.get('/change-password', (_req: Request, res: Response) => {
  res.redirect(301, '/app/user/change-password');
});

router.post('/change-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    await userService.changePassword(user.id, req.body.newPassword);
    (req.session as any).flashSuccess = 'Password changed';
    res.redirect(getAppReturnTo(req, '/user/profile'));
  } catch (err) { next(err); }
});

router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.redirect(301, '/app/user/orders');
  } catch (err) { next(err); }
});

router.get('/orders/:id/invoice.pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.findById(req.params.id);
    if (!order) return res.status(404).render('error', { title: 'Not found', message: 'Order not found', stack: '' });
    const pdf = await pdfService.generateInvoice(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) { next(err); }
});

router.get('/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.redirect(301, '/app/user/messages');
  } catch (err) { next(err); }
});

router.get('/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.redirect(301, '/app/user/reviews');
  } catch (err) { next(err); }
});

router.get('/upload-file', (_req: Request, res: Response) => {
  res.redirect(301, '/app/user/upload-file');
});

router.post('/upload-file', upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.file) {
      // INSECURE: unrestricted file upload saved directly to disk (CWE-434)
      // Purpose: demonstrates unrestricted file upload for Fortify DAST/SAST
      // Fix: Validate file extension, MIME type, and store outside web root
      const uploadPath = path.join('public/uploads', req.file.originalname);
      fs.writeFileSync(uploadPath, req.file.buffer);
      storageService.saveFile(req.file.originalname, req.file.buffer);
    }
    setReactResult(req, { kind: 'success', message: `File uploaded: ${req.file?.originalname}` });
    return res.redirect(getAppReturnTo(req, '/app/user/upload-file'));
  } catch (err) { next(err); }
});

router.get('/import-settings', (_req: Request, res: Response) => {
  res.redirect(301, '/app/user/import-settings');
});

router.post('/import-settings', (req: Request, res: Response) => {
  try {
    // INSECURE: insecure deserialization via node-serialize unserialize (CWE-502)
    // Purpose: demonstrates insecure deserialization for Fortify DAST/SAST
    // Fix: Use safe serialization formats like JSON.parse()
    const rawPayload = String(req.body.payload ?? '');
    const decoded = Buffer.from(rawPayload, 'base64').toString('utf8');
    const result = serialize.unserialize(decoded);
    setReactResult(req, { kind: 'result', content: JSON.stringify(result) });
    return res.redirect(getAppReturnTo(req, '/app/user/import-settings'));
  } catch (err: any) {
    setReactResult(req, { kind: 'error', content: err.message });
    return res.redirect(getAppReturnTo(req, '/app/user/import-settings'));
  }
});

router.get('/upload-xml-file', (_req: Request, res: Response) => {
  res.redirect(301, '/app/user/upload-xml-file');
});

router.post('/upload-xml-file', upload.single('xmlFile'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const xml = req.file?.buffer.toString('utf8') ?? String(req.body.xml ?? '');
    // INSECURE: XML parsed with external entities enabled (CWE-611)
    // Purpose: demonstrates XXE for Fortify DAST/SAST
    // Fix: Disable DTD processing and external entities completely
    const doc = libxmljs.parseXml(xml, { noent: true, dtdload: true } as any);
    setReactResult(req, { kind: 'result', content: doc.toString() });
    return res.redirect(getAppReturnTo(req, '/app/user/upload-xml-file'));
  } catch (err) { next(err); }
});

router.get('/download-file', (_req: Request, res: Response) => {
  res.redirect(301, '/app/user/download-file');
});

router.get('/files/download/unverified', (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = String(req.query.file ?? '');
    const data = storageService.loadAsResource(file, true);
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(file)}"`);
    res.send(data);
  } catch (err) { next(err); }
});

router.get('/command-shell', (_req: Request, res: Response) => {
  res.redirect(301, '/app/user/command-shell');
});

router.post('/command-shell', async (req: Request, res: Response) => {
  try {
    // INSECURE: OS command injection via child_process.execSync on raw user input (CWE-78)
    // Purpose: demonstrates command injection for Fortify DAST/SAST
    // Fix: Never execute shell commands from untrusted input
    const command = String(req.body.command ?? req.body.cmd ?? '');
    const output = execSync(command, { encoding: 'utf8' });
    setReactResult(req, { kind: 'result', content: output });
    return res.redirect(getAppReturnTo(req, '/app/user/command-shell'));
  } catch (err: any) {
    setReactResult(req, { kind: 'error', content: err.stdout || err.stderr || err.message });
    return res.redirect(getAppReturnTo(req, '/app/user/command-shell'));
  }
});

router.get('/log', (_req: Request, res: Response) => {
  res.redirect(301, '/app/user/log');
});

router.post('/log', (req: Request, res: Response) => {
  // INSECURE: log injection via raw user-controlled input (CWE-117)
  // Purpose: demonstrates log forging for Fortify DAST/SAST
  // Fix: Strip CR/LF and use structured logging before writing
  const msg = String(req.body.message ?? '');
  console.log('User log message: ' + msg);
  fs.appendFileSync('./logs/iwa.log', msg + '\n');
  res.redirect(getAppReturnTo(req, '/user/log'));
});

router.get('/security', (_req: Request, res: Response) => {
  res.redirect(301, '/app/user/security');
});

router.post('/security/enable-mfa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const type = (req.body.type ?? MfaType.MFA_EMAIL) as MfaType;
    if (type === MfaType.MFA_APP) {
      const secret = verificationService.generateTotpSecret();
      await userService.updateInsecure(user.id, { mfaType: type, mfaSecret: secret.base32 });
      const qrCode = await verificationService.generateQrCode(secret.otpauth_url ?? '');
      setReactResult(req, { kind: 'mfa', message: 'Scan this QR code with your authenticator app.', qrCode, secret: secret.base32 });
      return res.redirect(getAppReturnTo(req, '/app/user/security'));
    }
    await userService.updateInsecure(user.id, { mfaType: type });
    const otp = verificationService.generateOtp(user.id);
    if (type === MfaType.MFA_EMAIL && user.email) await emailService.sendOtp(user.email, otp);
    if (type === MfaType.MFA_SMS && user.phone) await smsService.sendOtp(user.phone, otp);
    (req.session as any).flashSuccess = `Enabled MFA type ${type}`;
    res.redirect(getAppReturnTo(req, '/user/security'));
  } catch (err) { next(err); }
});

export { router as userRouter };

// These routes DON'T need requireAuth - add them to a separate public user router
