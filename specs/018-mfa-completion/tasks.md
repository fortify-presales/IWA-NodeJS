# Tasks: MFA Completion (Email, SMS, TOTP)

**Input**: `spec.md` and `plan.md`

## Phase 1: Service Layer

- [x] T001 Extend `packages/api/src/services/VerificationService.ts` with `generateDeterministicTotpSecret`, `buildOtpauthUrl`, `peekOtp`, `currentTotp` and markers on the existing OTP helpers.
- [x] T002 Add `packages/api/src/services/MfaService.ts` owning enrol/confirm/challenge/verify/disable/regenerate.
- [x] T003 Seed `admin`/`user1` with TOTP and `user2` with email OTP in `packages/api/src/config/seed.ts`.
- [x] T004 Add `mfaSecret` to the `UserRepository.update` allowlist.

## Phase 2: Web Session Flow

- [x] T005 Route `POST /login` through `MfaService.challenge` and keep the session authenticated (CWE-287).
- [x] T006 Add `GET /login-mfa/hint` (CWE-200) and `POST /login-mfa/reset` (CWE-640).
- [x] T007 Rewrite `/user/security/enable-mfa` and add `confirm-mfa`, `disable-mfa`, `regenerate-totp` and `totp-secret` (CWE-639).

## Phase 3: API Surface

- [x] T008 Add `packages/api/src/api/v3/mfa.ts` and mount it in `app.ts`.
- [x] T009 Add the `202` MFA challenge step to `POST /api/v3/site/sign-in`.
- [x] T010 Return the MFA block from `GET /api/v3/account/summary` (CWE-522).

## Phase 4: Frontend

- [x] T011 Add the demo hint panel and reset form to `MfaPage`.
- [x] T012 Rebuild `SecurityPage` with factor selection, confirm and disable.
- [x] T013 Add the authenticator panel and IDOR lookup to `ProfilePage`.
- [x] T014 Add supporting styles to `packages/web/src/styles.css`.

## Phase 5: Documentation and Validation

- [x] T015 Add seven entries to `packages/web/src/publicPages.tsx`.
- [x] T016 Add `packages/api/tests/vulnerabilities/mfa.test.ts`.
- [x] T017 Add DEMO.md sections 24–30 and update the token-retrieval section.
- [x] T018 Update the Playwright `login()` helper to complete the TOTP challenge.
- [x] T019 Add the `/api/v3/mfa/*` requests to the Postman collections.
- [x] T020 Build the workspace and run the vulnerability suite.
