import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Admin diagnostics SSRF - CWE-918', () => {
  it('VULNERABLE: keeps the request URL at direct Node HTTP client sinks for SAST', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/web/admin/index.ts'),
      'utf8',
    );

    expect(source).toContain('https.get(targetUrl, handleResponse)');
    expect(source).toContain('http.get(targetUrl, handleResponse)');
    expect(source).toContain('INSECURE: SSRF via arbitrary URL fetch');
  });
});
