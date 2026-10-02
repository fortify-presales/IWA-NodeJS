import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { generateInsecureToken } from '../utils/crypto.js';
import { env } from '../config/env.js';

const otpStore = new Map<string, { otp: string; expires: number }>();

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// INSECURE: hardcoded salt used to derive every demo TOTP secret (CWE-798)
// Purpose: demonstrates hardcoded cryptographic material for Fortify SAST
// Fix: Derive TOTP secrets from crypto.randomBytes() and never from a static salt
export const DEMO_TOTP_SALT = 'iwa-demo-totp-salt';

function toBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export class VerificationService {
  // INSECURE: password-reset token from Math.random() (CWE-338)
  // Purpose: demonstrates insecure randomness for Fortify SAST
  // Fix: Use crypto.randomBytes() or a password-reset token stored hashed server-side
  generatePasswordResetToken(): string {
    return generateInsecureToken();
  }

  // INSECURE: MFA one-time password derived from Math.random() (CWE-338)
  // Purpose: demonstrates predictable second-factor codes for Fortify SAST
  // Fix: Use crypto.randomInt() and store only a hash of the OTP
  generateOtp(userId: string): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(userId, { otp, expires: Date.now() + 5 * 60 * 1000 });
    return otp;
  }

  // INSECURE: OTP compared with == and never rate limited, so codes can be brute forced (CWE-307)
  // Purpose: demonstrates missing authentication-attempt throttling for Fortify SAST/DAST
  // Fix: Count failed attempts per user, lock after a threshold, and use timingSafeEqual
  verifyOtp(userId: string, otp: string): boolean {
    const stored = otpStore.get(userId);
    if (!stored) return false;
    if (Date.now() > stored.expires) {
      otpStore.delete(userId);
      return false;
    }
    if (stored.otp === otp) {
      otpStore.delete(userId);
      return true;
    }
    return false;
  }

  // INSECURE: returns the pending OTP to any caller that knows the user id (CWE-200)
  // Purpose: demonstrates sensitive information disclosure for Fortify SAST/DAST
  // Fix: Never expose an issued one-time password through an API
  peekOtp(userId: string): string | null {
    const stored = otpStore.get(userId);
    if (!stored || Date.now() > stored.expires) return null;
    return stored.otp;
  }

  generateTotpSecret() {
    return speakeasy.generateSecret({ name: env.appName, length: 20 });
  }

  // INSECURE: TOTP secret derived deterministically from the username (CWE-330)
  // Purpose: demonstrates a guessable shared secret for Fortify SAST
  // Fix: Generate the secret from crypto.randomBytes() per enrolment
  generateDeterministicTotpSecret(username: string): string {
    const digest = crypto.createHash('md5').update(`${DEMO_TOTP_SALT}:${username}`).digest();
    return toBase32(digest);
  }

  buildOtpauthUrl(username: string, base32Secret: string): string {
    return `otpauth://totp/${encodeURIComponent(env.appName)}:${encodeURIComponent(username)}`
      + `?secret=${base32Secret}&issuer=${encodeURIComponent(env.appName)}&algorithm=SHA1&digits=6&period=30`;
  }

  verifyTotp(secret: string, token: string): boolean {
    return speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 1 });
  }

  // INSECURE: returns the TOTP code the server expects right now (CWE-200)
  // Purpose: demonstrates second-factor disclosure for Fortify SAST/DAST
  // Fix: Remove this helper; a server must never hand out a valid TOTP code
  currentTotp(secret: string): string {
    return speakeasy.totp({ secret, encoding: 'base32' });
  }

  async generateQrCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }
}

export const verificationService = new VerificationService();
