# Implementation Plan: Product Reviews

**Branch**: `001-product-reviews` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-product-reviews/spec.md`

## Summary

Build a product review workflow spanning persistence, API access, product display, account review management, and admin visibility. Preserve the intentionally vulnerable output behavior for security demonstrations and document it through the vulnerability lifecycle artifacts.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none
- **Data model changes**: Add review persistence associated with products and users.
- **Unknowns**: none

## Constitution Check

*GATE: must pass before implementation starts; re-check if the plan changes materially.*

- [x] **I. Intentional Insecurity Is Sacrosanct** — no existing `INSECURE:` marker, vulnerability table entry, or pinned vulnerable dependency is fixed, removed, or weakened by this plan.
- [x] **II. Documented Vulnerability Lifecycle** — the marker comment, `publicPages.tsx` entry, regression test, and `DEMO.md` entry are all scheduled as tasks.
- [x] **III. Monorepo Workspace Boundaries** — changes stay inside `packages/api` and `packages/web`; no path options added to `tsconfig.base.json`.
- [x] **IV. Fault-Tolerant Runtime Configuration** — no new optional external credential is introduced.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — no unrelated hardening or vulnerability retirement is included.

## Project Structure

### Documentation (this feature)

```text
specs/001-product-reviews/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/models/Review.ts
├── api/src/services/ReviewService.ts
├── api/src/api/v3/reviews.ts
├── api/tests/vulnerabilities/xss.test.ts
└── web/src/publicPages.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |