import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (env.smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
      });
    } else {
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: env.smtpFrom,
        to,
        subject,
        html,
      });
      if (!env.smtpHost) {
        logger.info(`[EmailService] Email (console): ${JSON.stringify(info.message)}`);
      }
    } catch (err) {
      logger.error(`[EmailService] Failed to send email: ${err}`);
    }
  }

  async sendOtp(to: string, otp: string) {
    await this.sendEmail(
      to,
      'Your IWA Pharmacy Direct OTP',
      `<p>Your one-time password is: <strong>${otp}</strong></p><p>Expires in 5 minutes.</p>`
    );
  }

  async sendVerification(to: string, token: string) {
    const link = `http://localhost:${env.port}/user/verify?token=${token}`;
    await this.sendEmail(to, 'Verify your IWA Pharmacy Direct account', `<p>Click <a href="${link}">here</a> to verify your account.</p>`);
  }

  async sendPasswordReset(to: string, token: string) {
    const link = `http://localhost:${env.port}/user/reset-password?token=${token}`;
    await this.sendEmail(to, 'Password reset for IWA Pharmacy Direct', `<p>Click <a href="${link}">here</a> to reset your password.</p>`);
  }
}

export const emailService = new EmailService();
