import { describe, it, expect } from 'vitest';
import { deepMerge } from '../../src/utils/deepMerge.js';
import { md5Hash, generateInsecureToken } from '../../src/utils/crypto.js';

describe('XSS / Weak Crypto Vulnerabilities - CWE-79, CWE-327, CWE-338', () => {
  it('VULNERABLE: deepMerge allows prototype pollution (CWE-1321)', () => {
    const payload = JSON.parse('{"__proto__":{"xssTest":true}}');
    deepMerge({}, payload);
    expect((Object.prototype as any).xssTest).toBe(true);
    delete (Object.prototype as any).xssTest;
  });

  it('VULNERABLE: md5Hash uses weak algorithm (CWE-327)', () => {
    const hash = md5Hash('password');
    // MD5 is weak — returns known hash value
    expect(hash).toBe('5f4dcc3b5aa765d61d8327deb882cf99');
  });

  it('VULNERABLE: generateInsecureToken uses Math.random (CWE-338)', () => {
    const tokens = new Set();
    for (let i = 0; i < 100; i++) tokens.add(generateInsecureToken());
    // Should generate different tokens each time but they're not cryptographically secure
    expect(tokens.size).toBeGreaterThan(90);
  });
});
