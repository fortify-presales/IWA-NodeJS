import { describe, it, expect } from 'vitest';
import { generateInsecureToken, generateSecureToken, md5Hash } from '../../src/utils/crypto.js';
import { paginate, buildPaginationMeta } from '../../src/utils/pagination.js';
import { deepMerge } from '../../src/utils/deepMerge.js';
import { apiResponse } from '../../src/utils/web.js';

describe('crypto utils', () => {
  it('generateInsecureToken returns a string', () => {
    const token = generateInsecureToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('generateSecureToken returns 64-char hex string', () => {
    const token = generateSecureToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('md5Hash returns md5 hash', () => {
    const hash = md5Hash('password');
    expect(hash).toBe('5f4dcc3b5aa765d61d8327deb882cf99');
  });
});

describe('pagination utils', () => {
  it('paginate computes correct limit/offset', () => {
    expect(paginate(1, 10)).toEqual({ limit: 10, offset: 0 });
    expect(paginate(2, 10)).toEqual({ limit: 10, offset: 10 });
    expect(paginate(3, 25)).toEqual({ limit: 25, offset: 50 });
  });

  it('buildPaginationMeta calculates totalPages', () => {
    const meta = buildPaginationMeta(1, 10, 25);
    expect(meta.totalPages).toBe(3);
    expect(meta.total).toBe(25);
  });
});

describe('deepMerge - prototype pollution (CWE-1321)', () => {
  it('merges objects correctly', () => {
    const target = { a: 1 };
    const result = deepMerge(target, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  // INSECURE: this test asserts prototype pollution IS possible (vulnerability regression test)
  it('VULNERABLE: allows __proto__ pollution', () => {
    const payload = JSON.parse('{"__proto__":{"polluted":true}}');
    deepMerge({}, payload);
    // Prototype pollution will affect ({} as any).polluted
    // This asserts the vulnerability exists
    expect((({} as any).polluted)).toBe(true);
    // Clean up
    delete (Object.prototype as any).polluted;
  });
});

describe('apiResponse', () => {
  it('returns envelope format', () => {
    const resp = apiResponse('success', 'OK', { foo: 'bar' });
    expect(resp.status).toBe('success');
    expect(resp.message).toBe('OK');
    expect(resp.data).toEqual({ foo: 'bar' });
    expect(resp.timestamp).toBeDefined();
  });
});
