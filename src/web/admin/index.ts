import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import http from 'http';
import https from 'https';
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { requireAdminAuth } from '../../middleware/requireAuth.js';
import { User } from '../../models/User.js';
import { Product } from '../../models/Product.js';
import { Order } from '../../models/Order.js';
import { Review } from '../../models/Review.js';
import { Message } from '../../models/Message.js';
import { logger } from '../../utils/logger.js';

const execAsync = promisify(exec);
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
const HARDCODED_ADMIN_BACKDOOR_PASSWORD = 'iwa-admin-backdoor-super-secret-token-cwe798';

router.use(requireAdminAuth);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.render('admin/index', {
      title: 'Admin Dashboard',
      stats: {
        users: await User.count(),
        products: await Product.count(),
        orders: await Order.count(),
        reviews: await Review.count(),
        messages: await Message.count(),
      },
    });
  } catch (err) { next(err); }
});

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keywords = (req.query.keywords as string) || '';
    const users = keywords
      ? await User.findAll({ where: { username: { [Op.like]: `%${keywords}%` } }, include: [{ all: true }] })
      : await User.findAll({ include: [{ all: true }] });
    res.render('admin/users', { title: 'Manage Users', users, keywords });
  } catch (err) { next(err); }
});

router.get('/products', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.render('admin/products', { title: 'Manage Products', products: await Product.findAll() });
  } catch (err) { next(err); }
});

router.get('/orders', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.render('admin/orders', { title: 'Manage Orders', orders: await Order.findAll() });
  } catch (err) { next(err); }
});

router.get('/reviews', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.render('admin/reviews', { title: 'Manage Reviews', reviews: await Review.findAll({ include: [{ all: true }] }) });
  } catch (err) { next(err); }
});

router.get('/messages', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.render('admin/messages', { title: 'Manage Messages', messages: await Message.findAll({ include: [{ all: true }] }) });
  } catch (err) { next(err); }
});

router.get('/backup', (_req: Request, res: Response) => {
  res.render('admin/backup', { title: 'Backup', result: null });
});

router.post('/backup', upload.single('archive'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const backupDir = './data/restore';
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const created: string[] = [];
    if (req.file) {
      // INSECURE: zip slip — extracts archive entries without path validation (CWE-22)
      // Purpose: demonstrates archive extraction traversal for Fortify DAST/SAST
      // Fix: Resolve each entry path and ensure it remains inside the extraction root
      const zip = new AdmZip(req.file.buffer);
      for (const entry of zip.getEntries()) {
        const outputPath = path.join(backupDir, entry.entryName);
        created.push(outputPath);
        zip.extractEntryTo(entry, backupDir, false, true);
      }
    } else {
      const outputPath = path.join(backupDir, String(req.body.entry ?? 'backup.json'));
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify({ createdAt: new Date().toISOString() }));
      created.push(outputPath);
    }
    res.render('admin/backup', { title: 'Backup', result: created.join('\n') });
  } catch (err) { next(err); }
});

router.get('/diagnostics', (_req: Request, res: Response) => {
  res.render('admin/diagnostics', { title: 'Diagnostics', evalResult: '', fetchResult: '' });
});

router.post('/diagnostics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let evalResult = '';
    let fetchResult = '';
    if (req.body.expr) {
      // INSECURE: eval of user-controlled expression (CWE-95)
      // Purpose: demonstrates code injection for Fortify DAST/SAST
      // Fix: Remove eval and expose specific safe diagnostics only
      evalResult = String(eval(String(req.body.expr)));
    }
    if (req.body.url) {
      // INSECURE: SSRF via arbitrary URL fetch (CWE-918)
      // Purpose: demonstrates server-side request forgery for Fortify DAST/SAST
      // Fix: Restrict outbound requests to an allowlist and block internal addresses
      const targetUrl = String(req.body.url);
      fetchResult = await new Promise<string>((resolve) => {
        const client = targetUrl.startsWith('https') ? https : http;
        client.get(targetUrl, response => {
          let body = '';
          response.on('data', chunk => { body += chunk; });
          response.on('end', () => resolve(body));
        }).on('error', err => resolve(err.message));
      });
    }
    res.render('admin/diagnostics', { title: 'Diagnostics', evalResult, fetchResult });
  } catch (err) { next(err); }
});

router.get('/log', (_req: Request, res: Response) => {
  const logContent = fs.existsSync('./logs/iwa.log') ? fs.readFileSync('./logs/iwa.log', 'utf8') : '';
  res.render('admin/log', { title: 'Admin Log', logContent });
});

router.post('/log', (req: Request, res: Response) => {
  // INSECURE: log injection via raw user-controlled input (CWE-117)
  // Purpose: demonstrates log forging for Fortify DAST/SAST
  // Fix: Strip CR/LF and use structured logging before writing
  const val = String(req.body.val ?? '');
  logger.info(`Admin log injection input: ${val}`);
  console.log(`Admin log entry: ${val}`);
  fs.appendFileSync('./logs/iwa.log', val + '\n');
  res.redirect('/admin/log');
});

router.get('/command-shell', (_req: Request, res: Response) => {
  res.render('admin/command-shell', { title: 'Admin Command Shell', output: '' });
});

router.post('/command-shell', async (req: Request, res: Response) => {
  try {
    // INSECURE: OS command injection via child_process.execSync on raw input (CWE-78)
    // Purpose: demonstrates command injection for Fortify DAST/SAST
    // Fix: Avoid shell execution and use safe parameterized system APIs only
    const cmd = String(req.body.cmd ?? '');
    const output = execSync(cmd, { encoding: 'utf8' });
    res.render('admin/command-shell', { title: 'Admin Command Shell', output });
  } catch (err: any) {
    res.render('admin/command-shell', { title: 'Admin Command Shell', output: err.stdout || err.stderr || err.message });
  }
});

router.get('/backdoor', (req: Request, res: Response) => {
  // INSECURE: hardcoded backdoor token (CWE-798)
  // Purpose: demonstrates hardcoded credentials/backdoor access for Fortify DAST/SAST
  // Fix: Remove the backdoor and rely on proper authenticated admin access only
  if (req.query.token === HARDCODED_ADMIN_BACKDOOR_PASSWORD) {
    return res.render('admin/backdoor', { title: 'Backdoor Access', granted: true, message: 'Backdoor access granted!', user: req.user });
  }
  return res.status(403).render('admin/backdoor', { title: 'Backdoor Access', granted: false, message: 'Invalid backdoor token', user: null });
});

export { router as adminRouter };
