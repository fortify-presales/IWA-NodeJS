import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import ConnectSQLite from 'connect-sqlite3';
import { Application } from 'express';
import { env } from './env.js';

const SQLiteStore = ConnectSQLite(session);

// INSECURE: CSRF disabled (CWE-352)
// Purpose: demonstrates missing CSRF protection for Fortify DAST
// Fix: Use csurf or similar CSRF middleware on all state-changing routes

// INSECURE: permissive CORS (CWE-942)
// Purpose: demonstrates overly permissive CORS for Fortify DAST
// Fix: Restrict to known origins with explicit allowlist

export function configureSecurity(app: Application) {
  // Helmet installed but with CSP and several protections disabled intentionally
  app.use(
    helmet({
      contentSecurityPolicy: false, // INSECURE: CSP disabled
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    })
  );

  // INSECURE: reflects any origin with credentials (CWE-942)
  app.use(cors({ origin: true, credentials: true }));

  app.use(
    session({
      // INSECURE: predictable session name (CWE-1004)
      // INSECURE: no httpOnly, no secure, no sameSite (CWE-614)
      // Purpose: demonstrates insecure session cookies
      // Fix: httpOnly: true, secure: true (HTTPS), sameSite: 'strict', regenerate on login
      name: 'IWASESSION',
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: false, // INSECURE: cookie accessible via JS (CWE-1004)
        secure: false,   // INSECURE: no HTTPS requirement (CWE-614)
        sameSite: false, // INSECURE: no sameSite (CWE-352)
        maxAge: 24 * 60 * 60 * 1000,
      },
      store: new (SQLiteStore as any)({ db: 'sessions.sqlite', dir: './data' }),
    })
  );
}
