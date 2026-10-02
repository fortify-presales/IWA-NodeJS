import { User } from '../models/User.js';
import { MfaType } from '../models/enums.js';
import { logger } from '../utils/logger.js';
import { userService } from './UserService.js';
import { verificationService } from './VerificationService.js';
import { emailService } from './EmailService.js';
import { smsService } from './SmsService.js';

export const MFA_TYPES: MfaType[] = [MfaType.MFA_NONE, MfaType.MFA_EMAIL, MfaType.MFA_SMS, MfaType.MFA_APP];

export const DEFAULT_MFA_TYPE = MfaType.MFA_APP;

export interface MfaEnrolment {
  mfaType: MfaType;
  secret?: string;
  otpauthUrl?: string;
  qrCode?: string;
  otp?: string;
  message: string;
}

export function coerceMfaType(raw: unknown): MfaType {
  const value = String(raw ?? '').trim().toUpperCase();
  const normalised = value.startsWith('MFA_') ? value : `MFA_${value}`;
  const match = MFA_TYPES.find(type => type === normalised || type === value);
  return match ?? DEFAULT_MFA_TYPE;
}

export class MfaService {
  async findUser(userId: string): Promise<User | null> {
    return User.findByPk(userId);
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return User.findOne({ where: { username } });
  }

  // INSECURE: returns the stored TOTP secret and a scannable QR to any caller (CWE-522, CWE-312)
  // Purpose: demonstrates insufficiently protected credentials for Fortify SAST/DAST
  // Fix: Never return the shared secret after enrolment; store it encrypted at rest
  async getStatus(user: User) {
    const secret = user.mfaSecret ?? '';
    const otpauthUrl = secret ? verificationService.buildOtpauthUrl(user.username, secret) : '';
    return {
      userId: user.id,
      username: user.username,
      mfaType: (user.mfaType ?? MfaType.MFA_NONE) as MfaType,
      enabled: (user.mfaType ?? MfaType.MFA_NONE) !== MfaType.MFA_NONE,
      secret,
      otpauthUrl,
      qrCode: otpauthUrl ? await verificationService.generateQrCode(otpauthUrl) : '',
      currentCode: secret ? verificationService.currentTotp(secret) : '',
    };
  }

  // INSECURE: enrolment is persisted before the user proves possession of the factor (CWE-287)
  // Purpose: demonstrates improper authentication for Fortify SAST
  // Fix: Hold the candidate secret in a pending store and only persist after confirmEnrolment()
  async beginEnrolment(user: User, type: MfaType): Promise<MfaEnrolment> {
    if (type === MfaType.MFA_NONE) {
      return this.disable(user);
    }

    if (type === MfaType.MFA_APP) {
      const secret = verificationService.generateDeterministicTotpSecret(user.username);
      await userService.updateInsecure(user.id, { mfaType: type, mfaSecret: secret });
      const otpauthUrl = verificationService.buildOtpauthUrl(user.username, secret);
      // INSECURE: writes the TOTP shared secret to the application log (CWE-532)
      // Purpose: demonstrates secrets in log files for Fortify SAST
      // Fix: Never log MFA secrets or one-time codes
      logger.info(`[MfaService] TOTP enrolled for ${user.username} secret=${secret}`);
      return {
        mfaType: type,
        secret,
        otpauthUrl,
        qrCode: await verificationService.generateQrCode(otpauthUrl),
        message: 'Scan this QR code with your authenticator app, then confirm with a generated code.',
      };
    }

    await userService.updateInsecure(user.id, { mfaType: type });
    const otp = verificationService.generateOtp(user.id);
    logger.info(`[MfaService] ${type} OTP for ${user.username}: ${otp}`);
    if (type === MfaType.MFA_EMAIL && user.email) await emailService.sendOtp(user.email, otp);
    if (type === MfaType.MFA_SMS && user.phone) await smsService.sendOtp(user.phone, otp);
    return {
      mfaType: type,
      otp,
      message: `A one-time code was sent via ${type === MfaType.MFA_EMAIL ? 'email' : 'SMS'}. Demo code: ${otp}`,
    };
  }

  async confirmEnrolment(user: User, code: string): Promise<boolean> {
    return this.verify(user, code);
  }

  // INSECURE: disables the second factor with no re-authentication or ownership check (CWE-640)
  // Purpose: demonstrates a weak account-recovery path for Fortify SAST/DAST
  // Fix: Require the current password plus a valid second factor before disabling MFA
  async disable(user: User): Promise<MfaEnrolment> {
    await userService.updateInsecure(user.id, { mfaType: MfaType.MFA_NONE, mfaSecret: null });
    logger.info(`[MfaService] MFA disabled for ${user.username}`);
    return { mfaType: MfaType.MFA_NONE, message: 'Multi-factor authentication disabled.' };
  }

  async regenerateSecret(user: User): Promise<MfaEnrolment> {
    return this.beginEnrolment(user, MfaType.MFA_APP);
  }

  async challenge(user: User): Promise<MfaEnrolment> {
    const type = (user.mfaType ?? MfaType.MFA_NONE) as MfaType;
    if (type === MfaType.MFA_APP) {
      const secret = user.mfaSecret || verificationService.generateDeterministicTotpSecret(user.username);
      if (!user.mfaSecret) await userService.updateInsecure(user.id, { mfaSecret: secret });
      const otpauthUrl = verificationService.buildOtpauthUrl(user.username, secret);
      return {
        mfaType: type,
        secret,
        otpauthUrl,
        qrCode: await verificationService.generateQrCode(otpauthUrl),
        message: 'Enter the 6-digit code from your authenticator app.',
      };
    }

    const otp = verificationService.generateOtp(user.id);
    // INSECURE: logs the delivered one-time code alongside the stored secret (CWE-532)
    // Purpose: demonstrates sensitive data in logs for Fortify SAST
    // Fix: Log only that a challenge was issued, never the code itself
    logger.info(`[MfaService] challenge for ${user.username}: otp=${otp} secret=${user.mfaSecret}`);
    if (type === MfaType.MFA_EMAIL && user.email) await emailService.sendOtp(user.email, otp);
    if (type === MfaType.MFA_SMS && user.phone) await smsService.sendOtp(user.phone, otp);
    return { mfaType: type, otp, message: 'A one-time code has been sent to you.' };
  }

  // INSECURE: unlimited verification attempts, no lockout and no challenge expiry (CWE-307)
  // Purpose: demonstrates brute-forceable second factor for Fortify DAST
  // Fix: Track attempts per pending challenge and abort the login after a small threshold
  verify(user: User, code: string): boolean {
    const type = (user.mfaType ?? MfaType.MFA_NONE) as MfaType;
    if (type === MfaType.MFA_NONE) return true;
    if (type === MfaType.MFA_APP) return verificationService.verifyTotp(user.mfaSecret, code);
    return verificationService.verifyOtp(user.id, code);
  }
}

export const mfaService = new MfaService();
