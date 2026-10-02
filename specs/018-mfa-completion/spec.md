# Feature Specification: MFA Completion (Email, SMS, TOTP)

**Status**: Implementing | **Branch**: `018-mfa-completion` | **Date**: 2026-10-01
**Input**: Complete the half-built multi-factor authentication feature end to end, with TOTP as the demo default, and add a set of intentionally insecure MFA patterns.

## Overview

The application shipped MFA screens, a `MfaType` enum, `mfaType`/`mfaSecret` columns and a
`VerificationService` with TOTP helpers, but the feature was never finished: the enrolment form posted a
`type` value the server never matched, so the QR/TOTP branch was unreachable from the UI; enrolment was
never confirmed; the profile page showed no MFA state; and the JWT sign-in path had no second factor at all.

This feature completes the flow for all three factor types, makes TOTP the default for demos, surfaces the
QR code and secret on both the challenge screen and the profile page, and adds a parallel `/api/v3/mfa`
surface so the behaviour is reachable from Postman and DAST.

## Is this an intentional vulnerability demonstration?

- [x] Yes — see Constitution Principle II.
  - **CWE**: CWE-200, CWE-287/CWE-863, CWE-307, CWE-330/CWE-338/CWE-798, CWE-522/CWE-312/CWE-532,
    CWE-640, CWE-639, CWE-306
  - **Purpose**: Demonstrate the full lifecycle of second-factor weaknesses — disclosure, bypass, brute
    force, predictable secrets, plaintext storage, weak recovery and IDOR — for Fortify SAST/DAST/FAA.
  - **Fix**: Hold candidate secrets pending until confirmed, keep the session unauthenticated until the
    challenge succeeds, gate every route on an "MFA satisfied" flag, rate limit code verification,
    generate secrets from `crypto.randomBytes()`, encrypt secrets at rest, never return or log them, and
    require re-authentication plus verified recovery codes before disabling MFA.
  - Confirms: vulnerability catalog, regression tests, and exact `DEMO.md` payloads are included in the
    implementation tasks.

## User Scenarios

### Primary scenario

Given a seeded user with TOTP enabled, when they sign in at `/app/login`, then they are redirected to
`/app/login-mfa`, where a QR code, base32 secret and live code are displayed so the demo is reproducible,
and entering a valid authenticator code completes the login.

### Additional scenarios

- A user enables Email or SMS MFA from `/app/user/security`; the one-time code is delivered through the
  existing console-logging `EmailService`/`SmsService` and echoed into the result panel.
- A user views their QR code and TOTP secret on `/app/user/profile` and rotates the secret in place.
- An API client calls `POST /api/v3/site/sign-in` without `mfaCode`, receives `202` with the challenge,
  then re-submits with a code to obtain a token pair.
- An attacker reaches `/login-mfa/hint`, `/api/v3/mfa/status/:userId` or `/api/v3/mfa/current-code/:userId`
  unauthenticated and recovers the second factor.

### Edge cases

- `MFA_NONE` accounts (`api`, `test`) keep the existing one-step sign-in.
- An unknown or malformed `type` value falls back to TOTP rather than erroring.
- A user with `MFA_APP` but no stored secret is given a derived one on first challenge.
- Failed confirmation leaves MFA enabled — this is the intentional CWE-287 behaviour, not a bug.

## Functional Requirements

- **FR-001**: Enrolment MUST support `MFA_EMAIL`, `MFA_SMS` and `MFA_APP`, with `MFA_APP` as the default.
- **FR-002**: Seeded `admin` and `user1` MUST be enrolled in TOTP with a reproducible secret; `user2` MUST
  use email OTP; `api` and `test` MUST remain `MFA_NONE`.
- **FR-003**: The `/app/login-mfa` challenge screen MUST display the QR code, secret and current code.
- **FR-004**: `/app/user/profile` MUST display MFA status, the QR code and the secret, and MUST offer
  secret regeneration.
- **FR-005**: `/app/user/security` MUST offer factor selection, confirmation and disable.
- **FR-006**: A `/api/v3/mfa` router MUST expose status, qrcode, enrol, confirm, verify, disable and
  current-code operations.
- **FR-007**: `POST /api/v3/site/sign-in` MUST return `202` with an MFA challenge when a factor is enrolled
  and no `mfaCode` is supplied.
- **FR-008**: All MFA logic MUST be centralised in a single `MfaService` so SAST dataflow is traceable.
- **FR-009**: Every intentional weakness MUST carry the `INSECURE:/Purpose:/Fix:` marker block.
- **FR-010**: The vulnerability catalog, regression tests and `DEMO.md` MUST cover each new CWE.

## Out of Scope

- Backup/recovery codes, WebAuthn/passkeys and trusted-device ("remember this browser") support.
- Encrypting `mfaSecret` at rest, rate limiting, and CSRF protection.
- Database migrations — the SQLite database is re-seeded.
- Hardening any pre-existing marked vulnerability.

## Success Criteria

- **SC-001**: `npm run build` succeeds for the workspace.
- **SC-002**: `npm run test:vulns -w packages/api` passes, including the new `mfa.test.ts`.
- **SC-003**: A browser login as `user1` completes through the TOTP challenge using the displayed code.
- **SC-004**: Each of the seven catalog entries can be reproduced with the documented `DEMO.md` payload.

## Affected Packages

- [ ] `packages/shared`
- [ ] `packages/agent`
- [x] `packages/api` — `MfaService`, `VerificationService`, seed, web and API routes, tests.
- [x] `packages/web` — challenge, security and profile pages, styles, vulnerability catalog.
