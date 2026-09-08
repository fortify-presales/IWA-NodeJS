# Implementation Plan: Authentication and MFA

**Branch**: `006-auth-mfa` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-auth-mfa/spec.md`

## Summary

Build the storefront identity lifecycle with registration, login, MFA verification, password reset, JWT authentication, refresh/session behavior, protected-route middleware, and corresponding React pages. Preserve the intentionally vulnerable authentication behaviors for security demonstrations and document them through the vulnerability lifecycle.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: authentication, JWT, and password hashing dependencies already used by the API package
- **Data model changes**: User identity, authority, MFA, token, and verification fields as required by the implemented models/services.
- **Unknowns**: none

## Constitution Check

*GATE: must pass before implementation starts; re-check if the plan changes materially.*

- [x] **I. Intentional Insecurity Is Sacrosanct** — no existing `INSECURE:` marker, vulnerability table entry, or pinned vulnerable dependency is fixed, removed, or weakened by this plan.
- [x] **II. Documented Vulnerability Lifecycle** — the marker comments, `publicPages.tsx` entries, regression tests where present, and `DEMO.md` entries are all scheduled as tasks.
- [x] **III. Monorepo Workspace Boundaries** — changes stay inside `packages/api` and `packages/web`; no path options added to `tsconfig.base.json`.
- [x] **IV. Fault-Tolerant Runtime Configuration** — auth secrets and defaults follow existing API configuration behavior and do not introduce optional third-party startup failures.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — no unrelated hardening or vulnerability retirement is included.

## Project Structure

### Documentation (this feature)

```text
specs/006-auth-mfa/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/api/v3/site.ts
├── api/src/config/passport.ts
├── api/src/config/env.ts
├── api/src/services/AuthService.ts
├── api/src/services/VerificationService.ts
├── api/src/middleware/authenticateJwt.ts
├── api/src/models/User.ts
└── web/src/authPages.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |