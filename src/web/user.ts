import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import libxmljs from 'libxmljs2';
import serialize from 'node-serialize';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { userService } from '../services/UserService.js';
import { orderService } from '../services/OrderService.js';
import { messageService } from '../services/MessageService.js';
import { reviewService } from '../services/ReviewService.js';
import { storageService } from '../services/StorageService.js';
import { pdfService } from '../services/PdfService.js';
import { verificationService } from '../services/VerificationService.js';
import { emailService } from '../services/EmailService.js';
import { smsService } from '../services/SmsService.js';
import { env } from '../config/env.js';
import { MfaType } from '../models/enums.js';

const execAsync = promisify(exec);
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/register', (_req: Request, res: Response) => {
  res.render('user/register', { title: 'Register' });
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, verificationToken } = await userService.register(req.body);
    (req.session as any).pendingVerificationUserId = user.id;
    (req.session as any).pendingVerificationToken = verificationToken;
    await emailService.sendVerification(user.email, verificationToken);
    (req.session as any).flashSuccess = `Registration successful. Demo verification token: ${verificationToken}`;
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
  res.render('user/forgot-password', { title: 'Forgot Password' });
});

router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      const token = verificationService.generatePasswordResetToken();
      await emailService.sendPasswordReset(user.email, token);
      (req.session as any).flashSuccess = `Password reset requested. Demo token: ${token}`;
    }
    res.redirect('/login');
  } catch (err) { next(err); }
});

router.use(requireAuth);

router.get('/home', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const unread = await messageService.countUnread(user.id);
    res.render('user/home', { title: 'My Account', unreadMessages: unread });
  } catch (err) { next(err); }
});

router.get('/profile', (req: Request, res: Response) => {
  res.render('user/profile', { title: 'My Profile', profileUser: req.user });
});

router.get('/edit-profile', (req: Request, res: Response) => {
  res.render('user/edit-profile', { title: 'Edit Profile', profileUser: req.user });
});

router.post('/edit-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    await userService.update(user.id, req.body);
    (req.session as any).flashSuccess = 'Profile updated';
    res.redirect('/user/profile');
  } catch (err) { next(err); }
});

router.get('/change-password', (_req: Request, res: Response) => {
  res.render('user/change-password', { title: 'Change Password' });
});

router.post('/change-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    await userService.changePassword(user.id, req.body.newPassword);
    (req.session as any).flashSuccess = 'Password changed';
    res.redirect('/user/profile');
  } catch (err) { next(err); }
});

router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const orders = await orderService.findByUser(user.id);
    res.render('user/orders', { title: 'My Orders', orders });
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
    const user = req.user as any;
    const messages = await messageService.findByUser(user.id);
    res.render('user/messages', { title: 'My Messages', messages });
  } catch (err) { next(err); }
});

router.get('/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const reviews = await Review.findAll({ where: { userId: user.id }, include: [{ model: Product }] });
    res.render('user/reviews', { title: 'My Reviews', reviews });
  } catch (err) { next(err); }
});

router.get('/upload-file', (_req: Request, res: Response) => {
  res.render('user/upload-file', { title: 'Upload File' });
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
    res.render('user/upload-file', { title: 'Upload File', success: `File uploaded: ${req.file?.originalname}` });
  } catch (err) { next(err); }
});

router.get('/import-settings', (_req: Request, res: Response) => {
  res.render('user/import-settings', { title: 'Import Settings', result: '' });
});

router.post('/import-settings', (req: Request, res: Response) => {
  try {
    // INSECURE: insecure deserialization via node-serialize unserialize (CWE-502)
    // Purpose: demonstrates insecure deserialization for Fortify DAST/SAST
    // Fix: Use safe serialization formats like JSON.parse()
    const rawPayload = String(req.body.payload ?? '');
    const decoded = Buffer.from(rawPayload, 'base64').toString('utf8');
    const result = serialize.unserialize(decoded);
    res.render('user/import-settings', { title: 'Import Settings', result: JSON.stringify(result) });
  } catch (err: any) {
    res.render('user/import-settings', { title: 'Import Settings', result: err.message });
  }
});

router.get('/upload-xml-file', (_req: Request, res: Response) => {
  res.render('user/upload-xml', { title: 'Upload XML File', parsed: '' });
});

router.post('/upload-xml-file', upload.single('xmlFile'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const xml = req.file?.buffer.toString('utf8') ?? String(req.body.xml ?? '');
    // INSECURE: XML parsed with external entities enabled (CWE-611)
    // Purpose: demonstrates XXE for Fortify DAST/SAST
    // Fix: Disable DTD processing and external entities completely
    const doc = libxmljs.parseXml(xml, { noent: true, dtdload: true } as any);
    res.render('user/upload-xml', { title: 'Upload XML File', parsed: doc.toString() });
  } catch (err) { next(err); }
});

router.get('/download-file', (_req: Request, res: Response) => {
  res.render('user/download-file', { title: 'Download File', files: storageService.listFiles() });
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
  res.render('user/command-shell', { title: 'Command Shell', output: '' });
});

router.post('/command-shell', async (req: Request, res: Response) => {
  try {
    // INSECURE: OS command injection via child_process.execSync on raw user input (CWE-78)
    // Purpose: demonstrates command injection for Fortify DAST/SAST
    // Fix: Never execute shell commands from untrusted input
    const command = String(req.body.command ?? req.body.cmd ?? '');
    const output = execSync(command, { encoding: 'utf8' });
    res.render('user/command-shell', { title: 'Command Shell', output });
  } catch (err: any) {
    res.render('user/command-shell', { title: 'Command Shell', output: err.stdout || err.stderr || err.message });
  }
});

router.get('/log', (_req: Request, res: Response) => {
  const logContent = fs.existsSync('./logs/iwa.log') ? fs.readFileSync('./logs/iwa.log', 'utf8') : '';
  res.render('user/log', { title: 'Application Log', logContent });
});

router.post('/log', (req: Request, res: Response) => {
  // INSECURE: log injection via raw user-controlled input (CWE-117)
  // Purpose: demonstrates log forging for Fortify DAST/SAST
  // Fix: Strip CR/LF and use structured logging before writing
  const msg = String(req.body.message ?? '');
  console.log('User log message: ' + msg);
  fs.appendFileSync('./logs/iwa.log', msg + '\n');
  res.redirect('/user/log');
});

router.get('/security', (_req: Request, res: Response) => {
  res.render('user/security', { title: 'Security Settings', qrCode: null });
});

router.post('/security/enable-mfa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const type = (req.body.type ?? MfaType.MFA_EMAIL) as MfaType;
    if (type === MfaType.MFA_APP) {
      const secret = verificationService.generateTotpSecret();
      await userService.updateInsecure(user.id, { mfaType: type, mfaSecret: secret.base32 });
      const qrCode = await verificationService.generateQrCode(secret.otpauth_url ?? '');
      return res.render('user/security', { title: 'Security Settings', qrCode, secret: secret.base32 });
    }
    await userService.updateInsecure(user.id, { mfaType: type });
    const otp = verificationService.generateOtp(user.id);
    if (type === MfaType.MFA_EMAIL && user.email) await emailService.sendOtp(user.email, otp);
    if (type === MfaType.MFA_SMS && user.phone) await smsService.sendOtp(user.phone, otp);
    (req.session as any).flashSuccess = `Enabled MFA type ${type}`;
    res.redirect('/user/security');
  } catch (err) { next(err); }
});

export { router as userRouter };

// These routes DON'T need requireAuth - add them to a separate public user router
