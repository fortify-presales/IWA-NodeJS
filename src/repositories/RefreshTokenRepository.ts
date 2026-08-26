import { RefreshToken } from '../models/RefreshToken.js';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';

export class RefreshTokenRepository {
  async create(userId: string, token: string): Promise<RefreshToken> {
    const expiryDate = new Date(Date.now() + env.jwtRefreshMs);
    return RefreshToken.create({ id: uuidv4(), token, expiryDate, userId });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return RefreshToken.findOne({ where: { token } });
  }

  async deleteByUserId(userId: string): Promise<number> {
    return RefreshToken.destroy({ where: { userId } });
  }

  async deleteByToken(token: string): Promise<number> {
    return RefreshToken.destroy({ where: { token } });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
