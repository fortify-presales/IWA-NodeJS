import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { verificationService } from '../../src/services/VerificationService.js';

const read = (relative: string) => fs.readFileSync(path.resolve(__dirname, relative), 'utf8');

describe('MFA secret disclosure - CWE-200', () => {
  it('VULNERABLE: /login-mfa/hint returns the pending account TOTP secret with no authentication', () => {
    const source = read('../../src/web/default.ts');
    expect(source).toContain("router.get('/login-mfa/hint'");
    expect(source).toContain('secret: status.secret');
    expect(source).toContain('INSECURE: hands the pending user\'s TOTP secret, QR code and live OTP to an unauthenticated caller (CWE-200)');
  });

  it('VULNERABLE: the API hands out a currently valid TOTP code', () => {
    const source = read('../../src/api/v3/mfa.ts');
    expect(source).toContain("router.get('/current-code/:userId'");
    expect(source).toContain('verificationService.currentTotp(user.mfaSecret)');
    expect(source).toContain('INSECURE: hands out a currently-valid second-factor code to anyone (CWE-200, CWE-306)');
  });

  it('VULNERABLE: JWT sign-in challenge returns TOTP enrollment material', () => {
    const source = read('../../src/api/v3/site.ts');
    expect(source).toContain('INSECURE: the MFA challenge response leaks the shared secret, QR and live code (CWE-200, CWE-522)');
    expect(source).toContain('secret: status.secret');
    expect(source).toContain('qrCode: status.qrCode');
    expect(source).toContain('currentCode: status.currentCode');
  });

  it('VULNERABLE: JWT sign-in returns a predictable MFA challenge token', () => {
    const source = read('../../src/api/v3/site.ts');
    expect(source).toContain('INSECURE: predictable MFA challenge token built from the user id and a timestamp (CWE-330)');
    expect(source).toContain('mfaToken: `${user.id}-${Date.now()}`');
  });

  it('VULNERABLE: the challenge screen fetches and renders the enrolment material', () => {
    const source = read('../../../web/src/authPages.tsx');
    expect(source).toContain("fetch('/login-mfa/hint'");
    expect(source).toContain('INSECURE: the challenge screen pulls the pending account\'s TOTP secret and live code (CWE-200)');
  });

  it('VULNERABLE: the reveal component renders MFA secrets into the browser', () => {
    const source = read('../../../web/src/components/MfaReveal.tsx');
    expect(source).toContain('INSECURE: renders MFA secrets and one-time codes in the client after user interaction (CWE-200, CWE-522)');
    expect(source).toContain('<code className="reveal-value">{value}</code>');
  });
});

describe('MFA bypass - CWE-287 / CWE-863', () => {
  it('VULNERABLE: the session stays authenticated while the second factor is pending', () => {
    const source = read('../../src/web/default.ts');
    expect(source).toContain('INSECURE: the session stays authenticated while the second factor is still pending (CWE-287, CWE-863)');
    // req.logout() must NOT be called in the MFA branch, otherwise the bypass is not reproducible.
    expect(source).not.toContain('req.logout((err) => { if (err) logger.error(err); });');
  });

  it('VULNERABLE: requireAuth has no MFA-satisfied check', () => {
    const source = read('../../src/middleware/requireAuth.ts');
    expect(source).not.toContain('mfa');
  });

  it('VULNERABLE: enrolment is persisted before the factor is proven', () => {
    const source = read('../../src/services/MfaService.ts');
    expect(source).toContain('INSECURE: enrolment is persisted before the user proves possession of the factor (CWE-287)');
    expect(source).toContain('await userService.updateInsecure(user.id, { mfaType: type, mfaSecret: secret });');
  });
});

describe('MFA brute force - CWE-307', () => {
  it('VULNERABLE: no attempt counter on the web challenge', () => {
    const source = read('../../src/web/default.ts');
    expect(source).toContain('INSECURE: unlimited MFA code attempts, no lockout and no challenge expiry (CWE-307)');
  });

  it('VULNERABLE: no attempt counter on the API verify endpoint', () => {
    const source = read('../../src/api/v3/mfa.ts');
    expect(source).toContain('INSECURE: public verification has no throttling, so codes can be enumerated at full speed (CWE-306, CWE-307)');
  });

  it('VULNERABLE: no attempt counter on the JWT sign-in MFA step', () => {
    const source = read('../../src/api/v3/site.ts');
    expect(source).toContain('INSECURE: unlimited MFA attempts on the API sign-in path (CWE-307)');
  });
});

describe('Predictable TOTP secret - CWE-330 / CWE-798', () => {
  it('VULNERABLE: the secret is derived from a hardcoded salt and the username', () => {
    const source = read('../../src/services/VerificationService.ts');
    expect(source).toContain("export const DEMO_TOTP_SALT = 'iwa-demo-totp-salt'");
    expect(source).toContain("crypto.createHash('md5').update(`${DEMO_TOTP_SALT}:${username}`)");
    expect(source).toContain('INSECURE: TOTP secret derived deterministically from the username (CWE-330)');
  });

  it('VULNERABLE: OTP codes still come from Math.random()', () => {
    const source = read('../../src/services/VerificationService.ts');
    expect(source).toContain('Math.floor(100000 + Math.random() * 900000)');
    expect(source).toContain('INSECURE: MFA one-time password derived from Math.random() (CWE-338)');
  });

  it('VULNERABLE: seeded demo accounts use the derivable secret', () => {
    const source = read('../../src/config/seed.ts');
    expect(source).toContain("mfaType: MfaType.MFA_APP, mfaSecret: demoTotpSecret('user1')");
  });

  it('VULNERABLE: each rotation changes the secret but remains predictable', () => {
    const initialSecret = verificationService.generateDeterministicTotpSecret('user1');
    const rotatedSecret = verificationService.generateRotatedTotpSecret('user1', initialSecret);
    const nextRotatedSecret = verificationService.generateRotatedTotpSecret('user1', rotatedSecret);
    const source = read('../../src/services/MfaService.ts');

    expect(rotatedSecret).not.toBe(initialSecret);
    expect(nextRotatedSecret).not.toBe(rotatedSecret);
    expect(rotatedSecret).toBe(verificationService.generateRotatedTotpSecret('user1', initialSecret));
    expect(source).toContain('verificationService.generateRotatedTotpSecret(user.username, user.mfaSecret ?? \'\')');
    expect(source).toContain('await userService.updateInsecure(user.id, { mfaType: MfaType.MFA_APP, mfaSecret: secret });');
  });
});

describe('Switching away from TOTP clears its secret', () => {
  it('clears mfaSecret when enabling Email or SMS', () => {
    const source = read('../../src/services/MfaService.ts');
    expect(source).toContain('await userService.updateInsecure(user.id, { mfaType: type, mfaSecret: null });');
  });

  it('does not expose a stale TOTP secret for non-TOTP factors', () => {
    const source = read('../../src/services/MfaService.ts');
    expect(source).toContain("const isTotp = (user.mfaType ?? MfaType.MFA_NONE) === MfaType.MFA_APP;");
    expect(source).toContain("const secret = isTotp ? user.mfaSecret ?? '' : '';");
  });
});

describe('MFA secret stored and returned in plaintext - CWE-522 / CWE-312', () => {
  it('VULNERABLE: the account summary returns mfaSecret', () => {
    const source = read('../../src/api/v3/account.ts');
    expect(source).toContain('mfaSecret: mfa.secret');
    expect(source).toContain("INSECURE: the account summary returns the user's plaintext TOTP secret and a scannable QR (CWE-522, CWE-312)");
  });

  it('VULNERABLE: the secret is written to the application log', () => {
    const source = read('../../src/services/MfaService.ts');
    expect(source).toContain('INSECURE: writes the TOTP shared secret to the application log (CWE-532)');
    expect(source).toContain('secret=${secret}');
  });
});

describe('MFA reset without verification - CWE-640', () => {
  it('VULNERABLE: /login-mfa/reset disables MFA from a username alone', () => {
    const source = read('../../src/web/default.ts');
    expect(source).toContain("router.post('/login-mfa/reset'");
    expect(source).toContain('INSECURE: "lost your device" disables MFA for any account given only a username (CWE-640)');
  });

  it('VULNERABLE: POST /api/v3/mfa/disable is unauthenticated', () => {
    const source = read('../../src/api/v3/mfa.ts');
    expect(source).toContain('INSECURE: unauthenticated MFA removal given only a username or id (CWE-640, CWE-306)');
  });

  it('VULNERABLE: web MFA disable has no current-password or current-factor check', () => {
    const source = read('../../src/web/user.ts');
    expect(source).toContain("router.post('/security/disable-mfa'");
    expect(source).toContain('INSECURE: no password or current-factor re-authentication before removing MFA (CWE-640)');
  });
});

describe('MFA API missing authentication - CWE-306', () => {
  it('VULNERABLE: status, QR and enrol routes disclose or change MFA without authentication', () => {
    const source = read('../../src/api/v3/mfa.ts');
    expect(source).toContain("router.get('/status/:userId'");
    expect(source).toContain('INSECURE: unauthenticated endpoint returning another account\'s TOTP secret (CWE-306, CWE-200, CWE-522)');
    expect(source).toContain("router.get('/qrcode/:userId'");
    expect(source).toContain('INSECURE: serves a scannable enrolment QR for any account with no authentication (CWE-306, CWE-200)');
    expect(source).toContain("router.post('/enrol'");
    expect(source).toContain('INSECURE: enrols any account without authentication and returns the plaintext secret (CWE-306, CWE-522)');
    expect(source).toContain('INSECURE: public confirmation cannot undo prior activation (CWE-287, CWE-306)');
    expect(source).toContain('INSECURE: hands out a currently-valid second-factor code to anyone (CWE-200, CWE-306)');
  });
});

describe('MFA IDOR - CWE-639', () => {
  it('VULNERABLE: totp-secret honours an arbitrary userId query parameter', () => {
    const source = read('../../src/web/user.ts');
    expect(source).toContain('INSECURE: returns any account\'s TOTP secret and QR when userId is supplied (CWE-639, CWE-522)');
    expect(source).toContain('String(req.query.userId ?? user.id)');
  });

  it('VULNERABLE: regenerate-totp rotates another account\'s secret', () => {
    const source = read('../../src/web/user.ts');
    expect(source).toContain('INSECURE: any logged-in user can rotate another account\'s TOTP secret via userId (CWE-639)');
  });

  it('VULNERABLE: the profile page exposes the lookup to the browser', () => {
    const source = read('../../../web/src/accountPages.tsx');
    expect(source).toContain('/user/security/totp-secret?userId=');
    expect(source).toContain('INSECURE: user-supplied id selects whose TOTP secret is returned (CWE-639)');
  });
});

describe('MFA secret mass assignment - CWE-915', () => {
  it('VULNERABLE: profile editing accepts mfaSecret from the request body', () => {
    const route = read('../../src/web/user.ts');
    const repository = read('../../src/repositories/UserRepository.ts');
    expect(route).toContain("router.post('/edit-profile'");
    expect(route).toContain('INSECURE: profile edits forward attacker-controlled MFA fields to a permissive allowlist (CWE-915)');
    expect(route).toContain('await userService.update(user.id, req.body);');
    expect(repository).toContain("'mfaType', 'mfaSecret'");
  });
});
