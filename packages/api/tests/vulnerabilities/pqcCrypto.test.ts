import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Non-PQC resilient algorithm - CWE-326', () => {
  it('VULNERABLE: uses RSA key generation covered by Fortify Node Crypto PQC rules', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/api/v3/crypto.ts'),
      'utf8',
    );

    expect(source).toContain("crypto.generateKeyPairSync('rsa'");
    expect(source).toContain('INSECURE: RSA key generation is not post-quantum cryptography');
  });
});