# Implementation Plan: MFA Completion (Email, SMS, TOTP)

**Branch**: `018-mfa-completion` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

## Summary

Introduce a single `MfaService` that owns enrolment, challenge, verification, disable and secret rotation
for all three factor types, then wire it into the existing web session flow, a new `/api/v3/mfa` router and
the JWT sign-in path. TOTP becomes the seeded default using a username-derived secret so demos reproduce
across database resets. The challenge screen and profile page intentionally surface the QR code and secret.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none — `speakeasy` and `qrcode` were already present.
- **Data model changes**: none; `mfaType`/`mfaSecret` already exist on `User`. Seed values change, and
  `mfaSecret` is added to the `UserRepository.update` allowlist.
- **Unknowns**: none.

## Constitution Check

- [x] Existing intentional vulnerabilities and markers are preserved.
- [x] New vulnerabilities include markers, catalog entries, regression tests, and `DEMO.md` payloads.
- [x] Workspace boundaries remain unchanged; no tsconfig path changes.
- [x] No new optional credentials or startup behavior are introduced.
- [x] No remediation is included.

## Project Structure

```text
specs/018-mfa-completion/
├── spec.md
├── plan.md
└── tasks.md
```

## Implementation Order

1. Extend `VerificationService` (derived secrets, `otpauth` URL builder, OTP/TOTP peek helpers) and add
   `MfaService`.
2. Seed `admin`/`user1` with TOTP and `user2` with email OTP; widen the repository update allowlist.
3. Rewire the web session flow: `POST /login`, `POST /login-mfa`, plus the new `/login-mfa/hint` and
   `/login-mfa/reset` routes, and the `/user/security/*` management routes.
4. Add the `/api/v3/mfa` router, the `202` MFA step on `POST /api/v3/site/sign-in`, and the MFA block on
   `GET /api/v3/account/summary`.
5. Rebuild the challenge, security and profile pages; add supporting styles.
6. Update `packages/web/src/publicPages.tsx`, `DEMO.md`, the Postman collection, and the Playwright login
   helper; add `packages/api/tests/vulnerabilities/mfa.test.ts`.
7. Build and run the vulnerability suite.

## Key Decisions

- **Predictable but rotating secrets**: the seeded/initial secret is
  `base32(md5("iwa-demo-totp-salt:" + username))`; each subsequent rotation is
  `base32(md5("iwa-demo-totp-salt:" + username + ":" + previousSecret))`. This keeps seeded demos
  reproducible and lets the rotation endpoint change the secret while demonstrating CWE-330.
- **`req.logout()` removed from the MFA branch**: keeping the session alive is what makes the CWE-287
  bypass reproducible; this is deliberate and asserted by a regression test.
- **Centralised `MfaService`**: a single module keeps Fortify dataflow between the secret source and the
  response/log sinks traceable, rather than spreading it across four route files.
- **`api` and `test` accounts stay `MFA_NONE`**: preserves a one-step sign-in for unrelated demos.

## Complexity Tracking

The Playwright `login()` helper now completes the TOTP step, because seeded accounts are MFA-enabled.
