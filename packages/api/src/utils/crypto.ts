import crypto from 'crypto';

// INSECURE: uses Math.random() for token generation (CWE-338)
// Purpose: demonstrates insecure randomness for Fortify SAST
// Fix: Use crypto.randomBytes() for cryptographically secure tokens
export function generateInsecureToken(): string {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// INSECURE: MD5 used for "legacy" password hashing (CWE-327)
// Purpose: demonstrates weak crypto for Fortify SAST
// Fix: Use bcrypt, argon2, or scrypt for password hashing
export function md5Hash(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex');
}

export function sha256Hash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
