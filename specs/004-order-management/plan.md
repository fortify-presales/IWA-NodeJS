# Implementation Plan: Order Management

**Branch**: `004-order-management` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-order-management/spec.md`

## Summary

Build the order lifecycle around the existing cart and account surfaces by adding order persistence, service/repository access, API routes, checkout integration, and admin visibility. Preserve the intentionally missing ownership check for the IDOR training scenario and document it through the vulnerability lifecycle.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none
- **Data model changes**: Add order persistence and relations to users/products.
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
specs/004-order-management/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/models/Order.ts
├── api/src/repositories/OrderRepository.ts
├── api/src/services/OrderService.ts
├── api/src/api/v3/orders.ts
├── web/src/cartPage.tsx
├── web/src/accountPages.tsx
└── web/src/adminPages.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |