import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

class SmsService {
  async sendSms(to: string, body: string) {
    if (!env.twilioAccountSid) {
      logger.info(`[SmsService] SMS (no-op): to=${to} body=${body}`);
      return;
    }
    try {
      const twilio = await import('twilio');
      const client = twilio.default(env.twilioAccountSid, env.twilioAuthToken);
      await client.messages.create({ from: env.twilioFrom, to, body });
    } catch (err) {
      logger.error(`[SmsService] Failed to send SMS: ${err}`);
    }
  }

  async sendOtp(to: string, otp: string) {
    await this.sendSms(to, `Your IWA Pharmacy Direct code: ${otp}. Expires in 5 minutes.`);
  }
}

export const smsService = new SmsService();
