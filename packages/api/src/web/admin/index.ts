import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import http from 'http';
import https from 'https';
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { requireAdminAuth } from '../../middleware/requireAuth.js';
import { logger } from '../../utils/logger.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
const HARDCODED_ADMIN_BACKDOOR_PASSWORD = 'iwa-admin-backdoor-super-secret-token-cwe798';

function getAdminAppReturnTo(req: Request, fallback: string) {
  const returnTo = String(req.body.appReturnTo ?? '');
  return returnTo.startsWith('/app/admin') ? returnTo : fallback;
}

function setAdminReactResult(req: Request, result: Record<string, unknown>) {
  (req.session as any).adminReactResult = result;
}

router.use(requireAdminAuth);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.redirect(301, '/app/admin');
  } catch (err) { next(err); }
});

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keywords = (req.query.keywords as string) || '';
    res.redirect(301, `/app/admin/users${keywords ? `?keywords=${encodeURIComponent(keywords)}` : ''}`);
  } catch (err) { next(err); }
});

router.get('/products', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.redirect(301, '/app/admin/products');
  } catch (err) { next(err); }
});

router.get('/orders', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.redirect(301, '/app/admin/orders');
  } catch (err) { next(err); }
});

router.get('/reviews', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.redirect(301, '/app/admin/reviews');
  } catch (err) { next(err); }
});

router.get('/messages', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.redirect(301, '/app/admin/messages');
  } catch (err) { next(err); }
});

router.get('/backup', (_req: Request, res: Response) => {
  res.redirect(301, '/app/admin/backup');
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
    setAdminReactResult(req, { kind: 'result', content: created.join('\n') });
    return res.redirect(getAdminAppReturnTo(req, '/app/admin/backup'));
  } catch (err) { next(err); }
});

router.get('/diagnostics', (_req: Request, res: Response) => {
  res.redirect(301, '/app/admin/diagnostics');
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
    setAdminReactResult(req, { kind: 'result', evalResult, fetchResult });
    return res.redirect(getAdminAppReturnTo(req, '/app/admin/diagnostics'));
  } catch (err) { next(err); }
});

router.get('/log', (_req: Request, res: Response) => {
  res.redirect(301, '/app/admin/log');
});

router.post('/log', (req: Request, res: Response) => {
  // INSECURE: log injection via raw user-controlled input (CWE-117)
  // Purpose: demonstrates log forging for Fortify DAST/SAST
  // Fix: Strip CR/LF and use structured logging before writing
  const val = String(req.body.val ?? '');
  logger.info(`Admin log injection input: ${val}`);
  console.log(`Admin log entry: ${val}`);
  fs.appendFileSync('./logs/iwa.log', val + '\n');
  res.redirect(getAdminAppReturnTo(req, '/admin/log'));
});

router.get('/command-shell', (_req: Request, res: Response) => {
  res.redirect(301, '/app/admin/command-shell');
});

router.post('/command-shell', async (req: Request, res: Response) => {
  try {
    // INSECURE: OS command injection via child_process.execSync on raw input (CWE-78)
    // Purpose: demonstrates command injection for Fortify DAST/SAST
    // Fix: Avoid shell execution and use safe parameterized system APIs only
    const cmd = String(req.body.cmd ?? '');
    const output = execSync(cmd, { encoding: 'utf8' });
    setAdminReactResult(req, { kind: 'result', content: output });
    return res.redirect(getAdminAppReturnTo(req, '/app/admin/command-shell'));
  } catch (err: any) {
    setAdminReactResult(req, { kind: 'error', content: err.stdout || err.stderr || err.message });
    return res.redirect(getAdminAppReturnTo(req, '/app/admin/command-shell'));
  }
});

router.get('/backdoor', (req: Request, res: Response) => {
  // INSECURE: hardcoded backdoor token (CWE-798)
  // Purpose: demonstrates hardcoded credentials/backdoor access for Fortify DAST/SAST
  // Fix: Remove the backdoor and rely on proper authenticated admin access only
  const tokenValue = String(req.query.token ?? '');
  const token = tokenValue ? `?token=${encodeURIComponent(tokenValue === HARDCODED_ADMIN_BACKDOOR_PASSWORD ? HARDCODED_ADMIN_BACKDOOR_PASSWORD : tokenValue)}` : '';
  return res.redirect(301, `/app/admin/backdoor${token}`);
});

export { router as adminRouter };
