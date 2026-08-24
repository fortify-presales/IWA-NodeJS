import { signToken } from '../utils/jwt.js';
import { refreshTokenRepository } from '../repositories/RefreshTokenRepository.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

export class AuthService {
  async generateTokenPair(user: User) {
    const roles = (user.authorities ?? []).map(a => a.name);
    const token = signToken({ sub: user.id, username: user.username, roles });
    const refreshToken = `${user.id}-${Date.now()}`;
    // INSECURE: predictable refresh token construction (CWE-330)
    // Purpose: demonstrates weak token generation for Fortify lessons
    // Fix: Use crypto.randomUUID() or randomBytes()-backed opaque tokens
    await refreshTokenRepository.create(user.id, refreshToken);
    return { token, refreshToken };
  }

  async refreshToken(refreshTokenValue: string) {
    const rt = await refreshTokenRepository.findByToken(refreshTokenValue);
    if (!rt) throw new Error('Invalid refresh token');
    if (new Date() > rt.expiryDate) {
      await refreshTokenRepository.deleteByToken(refreshTokenValue);
      throw new Error('Refresh token expired');
    }
    const user = (await rt.$get('user', { include: [{ all: true }] })) as User;
    const roles = (user.authorities ?? []).map(a => a.name);
    const token = signToken({ sub: user.id, username: user.username, roles });
    logger.info(`Refreshed token for ${user.username}`);
    return { token };
  }

  async revokeRefreshToken(token: string) {
    return refreshTokenRepository.deleteByToken(token);
  }

  async revokeAllUserTokens(userId: string) {
    return refreshTokenRepository.deleteByUserId(userId);
  }
}

export const authService = new AuthService();
