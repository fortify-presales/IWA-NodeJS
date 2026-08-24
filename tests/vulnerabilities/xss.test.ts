import { describe, it, expect } from 'vitest';
import request from 'supertest';

describe('XSS Vulnerabilities - CWE-79', () => {
  it('VULNERABLE: deepMerge allows prototype pollution', () => {
    const { deepMerge } = require('../../src/utils/deepMerge.js');
    const payload = JSON.parse('{"__proto__":{"xssTest":true}}');
    deepMerge({}, payload);
    expect((Object.prototype as any).xssTest).toBe(true);
    delete (Object.prototype as any).xssTest;
  });

  it('VULNERABLE: md5Hash uses weak algorithm', () => {
    const { md5Hash } = require('../../src/utils/crypto.js');
    const hash = md5Hash('password');
    // MD5 is weak — returns known hash value
    expect(hash).toBe('5f4dcc3b5aa765d61d8327deb882cf99');
  });

  it('VULNERABLE: generateInsecureToken uses Math.random', () => {
    const { generateInsecureToken } = require('../../src/utils/crypto.js');
    const tokens = new Set();
    for (let i = 0; i < 100; i++) tokens.add(generateInsecureToken());
    // Should generate different tokens each time but they're not cryptographically secure
    expect(tokens.size).toBeGreaterThan(90); // probabilistic — Math.random is seeded differently each call
  });
});
