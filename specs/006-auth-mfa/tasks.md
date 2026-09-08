# Tasks: Authentication and MFA

**Input**: Design documents from `specs/006-auth-mfa/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II when a vulnerability is added.

## Phase 1: Setup

- [x] T001 Add site authentication routes in `packages/api/src/api/v3/site.ts`
- [x] T002 Add authentication page routing in `packages/web/src/authPages.tsx`

## Phase 2: Foundational (blocking prerequisites)

- [x] T003 Add user identity and authority fields in `packages/api/src/models/User.ts` and related authority models
- [x] T004 Add authentication and token logic in `packages/api/src/services/AuthService.ts`
- [x] T005 Add verification token behavior in `packages/api/src/services/VerificationService.ts`
- [x] T006 Add Passport and JWT middleware configuration in `packages/api/src/config/passport.ts` and `packages/api/src/middleware/authenticateJwt.ts`

## Phase 3: Core Implementation

- [x] T007 [P] Add registration and login UI in `packages/web/src/authPages.tsx`
- [x] T008 [P] Add MFA verification UI in `packages/web/src/authPages.tsx`
- [x] T009 [P] Add forgot-password and password-reset UI in `packages/web/src/authPages.tsx`
- [x] T010 Wire protected account/admin route behavior to authenticated sessions

## Phase 4: Vulnerability Documentation

- [x] T011 Add `INSECURE:`/`Purpose:`/`Fix:` marker comments above vulnerable authentication code
- [x] T012 Add authentication vulnerability table entries in `packages/web/src/publicPages.tsx`
- [x] T013 Add or confirm vulnerability regression coverage under `packages/api/tests/vulnerabilities/`
- [x] T014 Document exact weak-token, sensitive-logging, missing-rate-limit, and hardcoded-secret demonstrations in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T015 Confirm authentication configuration is compatible with package-local and root `.env` loading
- [x] T016 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last