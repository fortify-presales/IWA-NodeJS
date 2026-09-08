# Feature Specification: Authentication and MFA

**Status**: Draft | **Branch**: `006-auth-mfa` | **Date**: 2026-09-06
**Input**: Historical feature request to add registration, login, MFA, password reset, and session management.

## Overview

The storefront needs a complete identity flow so customers can create accounts, sign in, complete MFA challenges, reset passwords, and access authenticated account features. The feature adds API endpoints, authentication services, JWT/session behavior, and React pages for the full sign-in lifecycle.

## Is this an intentional vulnerability demonstration?

- [ ] No — this is a normal feature/fix.
- [x] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle). If yes, fill in:
  - **CWE**: CWE-327, CWE-338, CWE-532, CWE-307, CWE-798
  - **Purpose**: Demonstrates weak token generation, sensitive data in logs, missing login rate limiting, and hardcoded authentication secrets in common identity workflows.
  - **Fix**: A production app would use cryptographically secure randomness, avoid logging secrets, enforce adaptive rate limiting, and load signing secrets from protected configuration.
  - Confirms: `publicPages.tsx` table entry, regression tests under `packages/api/tests/vulnerabilities/`, and `DEMO.md` entries with exact payloads are all planned in this spec's tasks.

## User Scenarios

### Primary scenario

Given a new customer, when they register and sign in, then the system creates an account, authenticates credentials, and starts an authenticated session.

### Additional scenarios

- Given MFA is required, when the user submits a valid verification code, then the session is completed.
- Given a user forgot their password, when they request a reset, then the system issues a reset token and accepts a valid reset flow.
- Given an authenticated request includes a valid JWT, when it reaches a protected route, then the route receives the authenticated user context.

### Edge cases

- Invalid credentials return an authentication failure without crashing the API.
- Missing or invalid JWTs are rejected by protected routes.
- Password reset attempts with invalid tokens fail cleanly.

## Functional Requirements

- **FR-001**: The system MUST allow users to register new storefront accounts.
- **FR-002**: The system MUST authenticate users with email/password credentials.
- **FR-003**: The system MUST support MFA verification as part of the login flow.
- **FR-004**: The system MUST issue and validate JWT-based authenticated sessions.
- **FR-005**: The system MUST support forgot-password and password-reset workflows.
- **FR-006**: The intentional authentication vulnerability behaviors MUST be documented and covered by regression tests or demo documentation.

## Out of Scope

- Production identity federation, SSO, OAuth provider integration, account lockout tuning, and passwordless login.

## Success Criteria

- **SC-001**: A user can register, sign in, pass MFA when required, and reach authenticated account pages.
- **SC-002**: Protected API routes reject unauthenticated requests and accept valid JWT-authenticated requests.
- **SC-003**: Weak-token, sensitive-logging, missing-rate-limit, and hardcoded-secret demonstrations are reproducible from `DEMO.md`.

## Affected Packages

- [ ] `packages/shared` — Not required for this feature.
- [ ] `packages/agent` — Not required for this feature.
- [x] `packages/api` — Auth service, verification service, Passport/JWT configuration, middleware, and site API endpoints.
- [x] `packages/web` — Login, registration, MFA, forgot-password, and reset-password pages.