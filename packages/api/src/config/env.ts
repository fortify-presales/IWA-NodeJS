import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// `npm run dev -w packages/api` / `npm start -w packages/api` run with cwd=packages/api, so the
// default dotenv lookup (cwd/.env) misses the monorepo root .env that README/CONTRIBUTING tell
// developers to create. Load cwd/.env first (e.g. a container's /app/.env), then fall back to the
// repo root .env without overriding anything already set.
dotenv.config();
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../.env') });

// INSECURE: hardcoded fallback secrets in code (CWE-798)
// Purpose: Demonstrates hardcoded credentials vulnerability for Fortify SAST
// Fix: Always require secrets from environment; fail fast if missing

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? (process.env.NODE_ENV === 'production' ? '8080' : '8888'), 10),

  databaseUrl: process.env.DATABASE_URL ?? './data/iwa.sqlite',

  // INSECURE: hardcoded fallback JWT secret (CWE-798)
  jwtSecret: process.env.JWT_SECRET ?? 'iwa-super-secret-jwt-key-hardcoded-insecure-cwe-798',
  jwtExpirationMs: parseInt(process.env.JWT_EXPIRATION_MS ?? '86400000', 10),
  jwtRefreshMs: parseInt(process.env.JWT_REFRESH_MS ?? '86400000', 10),

  // INSECURE: hardcoded fallback session secret (CWE-798)
  sessionSecret: process.env.SESSION_SECRET ?? 'iwa-hardcoded-session-secret-cwe-798',

  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: parseInt(process.env.SMTP_PORT ?? '1025', 10),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? 'noreply@iwa-pharmacy.local',

  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? '',
  twilioFrom: process.env.TWILIO_FROM ?? '',

  appName: process.env.APP_NAME ?? 'IWA Pharmacy Direct',
  appVersion: process.env.APP_VERSION ?? '1.0.0',
  appCurrency: process.env.APP_CURRENCY ?? 'GBP',
  pageSize: parseInt(process.env.PAGE_SIZE ?? '25', 10),
  uploadDir: process.env.UPLOAD_DIR ?? './data/uploads',
  logLevel: process.env.LOG_LEVEL ?? 'debug',

  isDevelopment: (process.env.NODE_ENV ?? 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
