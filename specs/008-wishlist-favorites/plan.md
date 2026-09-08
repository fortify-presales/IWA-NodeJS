# Implementation Plan: Wishlist and Favorites

**Branch**: `008-wishlist-favorites` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-wishlist-favorites/spec.md`

## Summary

Add wishlist persistence and account/product UI support so customers can save products for later. Include intentionally vulnerable wishlist note rendering and unrestricted wishlist access as documented demo cases.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none expected
- **Data model changes**: Add wishlist and wishlist item persistence associated with users and products.
- **Unknowns**: none

## Constitution Check

*GATE: must pass before implementation starts; re-check if the plan changes materially.*

- [x] **I. Intentional Insecurity Is Sacrosanct** — no existing `INSECURE:` marker, vulnerability table entry, or pinned vulnerable dependency is fixed, removed, or weakened by this plan.
- [x] **II. Documented Vulnerability Lifecycle** — the marker comments, `publicPages.tsx` entries, regression tests, and `DEMO.md` entries are scheduled as tasks.
- [x] **III. Monorepo Workspace Boundaries** — changes stay inside existing `packages/api` and `packages/web` workspaces; no path options added to `tsconfig.base.json`.
- [x] **IV. Fault-Tolerant Runtime Configuration** — no new optional external credential is introduced.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — no unrelated hardening or vulnerability retirement is included.

## Project Structure

### Documentation (this feature)

```text
specs/008-wishlist-favorites/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/models/Wishlist.ts
├── api/src/models/WishlistItem.ts
├── api/src/services/WishlistService.ts
├── api/src/api/v3/wishlist.ts
├── api/tests/vulnerabilities/wishlist.test.ts
├── web/src/accountPages.tsx
├── web/src/publicPages.tsx
└── web/src/products.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |