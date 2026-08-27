import { describe, it, expect } from 'vitest';
import fs from 'fs';
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

  it('VULNERABLE: React catalog preserves reflected and stored XSS sinks (CWE-79)', () => {
    const productSource = fs.readFileSync('frontend/src/products.tsx', 'utf8');
    const authSource = fs.readFileSync('frontend/src/authPages.tsx', 'utf8');
    const accountSource = fs.readFileSync('frontend/src/accountPages.tsx', 'utf8');
    const adminSource = fs.readFileSync('frontend/src/adminPages.tsx', 'utf8');

    expect(productSource).toContain('INSECURE: keywords reflected into DOM without escaping (CWE-79)');
    expect(productSource).toContain('INSECURE: stored review comments rendered as HTML (CWE-79)');
    expect(authSource).toContain('INSECURE: login error rendered into DOM without escaping (CWE-79)');
    expect(authSource).toContain('INSECURE: MFA error rendered into DOM without escaping (CWE-79)');
    expect(accountSource).toContain('INSECURE: message text rendered into DOM without escaping (CWE-79)');
    expect(accountSource).toContain('INSECURE: review comment rendered into DOM without escaping (CWE-79)');
    expect(accountSource).toContain('INSECURE: unrestricted file upload form accepts any type (CWE-434)');
    expect(accountSource).toContain('INSECURE: base64 payload posted to node-serialize unserialize sink (CWE-502)');
    expect(accountSource).toContain('INSECURE: XML upload reaches parser configured with external entities enabled (CWE-611)');
    expect(accountSource).toContain('INSECURE: filename is passed to unverified download endpoint (CWE-22)');
    expect(accountSource).toContain('INSECURE: command text posted to child_process.execSync sink (CWE-78)');
    expect(accountSource).toContain('INSECURE: log message accepts raw CR/LF-controlled input (CWE-117)');
    expect(accountSource).toContain('INSECURE: log content rendered into DOM without escaping (CWE-79, CWE-117)');
    expect(accountSource).toContain('INSECURE: account tool result rendered into DOM without escaping (CWE-79)');
    expect(adminSource).toContain('INSECURE: admin user search term reflected into DOM without escaping (CWE-79)');
    expect(adminSource).toContain('INSECURE: user authority names rendered into DOM without escaping (CWE-79)');
    expect(adminSource).toContain('INSECURE: review comments rendered into DOM without escaping (CWE-79)');
    expect(adminSource).toContain('INSECURE: message text rendered into DOM without escaping (CWE-79)');
    expect(adminSource).toContain('INSECURE: archive upload is extracted without path validation (CWE-22)');
    expect(adminSource).toContain('INSECURE: expression text posted to eval sink (CWE-95)');
    expect(adminSource).toContain('INSECURE: URL text posted to arbitrary server-side fetch sink (CWE-918)');
    expect(adminSource).toContain('INSECURE: command text posted to child_process.execSync sink (CWE-78)');
    expect(adminSource).toContain('INSECURE: admin log value accepts raw CR/LF-controlled input (CWE-117)');
    expect(adminSource).toContain('INSECURE: admin log content rendered into DOM without escaping (CWE-79, CWE-117)');
    expect(adminSource).toContain('INSECURE: admin tool result rendered into DOM without escaping (CWE-79)');
    expect(adminSource).toContain('INSECURE: hardcoded admin backdoor token displayed in frontend (CWE-798)');
    expect(`${productSource}\n${authSource}\n${accountSource}\n${adminSource}`.match(/dangerouslySetInnerHTML/g)).toHaveLength(14);
  });
});
