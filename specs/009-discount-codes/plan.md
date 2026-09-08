# Implementation Plan: Discount Codes and Promotions

**Branch**: `009-discount-codes` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-discount-codes/spec.md`

## Summary

Add promotion management for administrators and checkout discount redemption for customers. Integrate discounts into order total calculation while preserving intentionally vulnerable promotion search, redemption, and description rendering for demo coverage.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none expected
- **Data model changes**: Add discount code persistence with usage and expiry metadata; add discount relationship/fields to orders if needed.
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
specs/009-discount-codes/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/models/DiscountCode.ts
├── api/src/services/DiscountService.ts
├── api/src/api/v3/discounts.ts
├── api/src/api/v3/orders.ts
├── api/tests/vulnerabilities/discountCodes.test.ts
├── web/src/cartPage.tsx
├── web/src/adminPages.tsx
└── web/src/publicPages.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |