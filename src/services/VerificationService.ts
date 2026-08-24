import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { generateInsecureToken } from '../utils/crypto.js';
import { env } from '../config/env.js';

const otpStore = new Map<string, { otp: string; expires: number }>();

export class VerificationService {
  // INSECURE: password-reset token from Math.random() (CWE-338)
  // Purpose: demonstrates insecure randomness for Fortify SAST
  // Fix: Use crypto.randomBytes() or a password-reset token stored hashed server-side
  generatePasswordResetToken(): string {
    return generateInsecureToken();
  }

  generateOtp(userId: string): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(userId, { otp, expires: Date.now() + 5 * 60 * 1000 });
    return otp;
  }

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

  generateTotpSecret() {
    return speakeasy.generateSecret({ name: env.appName, length: 20 });
  }

  verifyTotp(secret: string, token: string): boolean {
    return speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 1 });
  }

  async generateQrCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }
}

export const verificationService = new VerificationService();
