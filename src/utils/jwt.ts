import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  // INSECURE: algorithm HS512 with potentially weak secret (CWE-327)
  // Purpose: demonstrates weak JWT signing for Fortify DAST/SAST
  // Fix: Use RS256 with rotating key pairs stored in a secrets manager
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: 'HS512',
    expiresIn: env.jwtExpirationMs / 1000,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
