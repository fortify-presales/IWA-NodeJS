# Implementation Plan: Inventory Management

**Branch**: `011-inventory-management` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-inventory-management/spec.md`

## Summary

Add secure inventory management for administrators, including product stock data, stock movement history, admin stock adjustment UI, and checkout stock decrement behavior. This feature should be implemented normally and should not add a vulnerability demonstration.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none expected
- **Data model changes**: Add stock quantity/threshold fields and a stock movement model.
- **Unknowns**: none

## Constitution Check

*GATE: must pass before implementation starts; re-check if the plan changes materially.*

- [x] **I. Intentional Insecurity Is Sacrosanct** — no existing `INSECURE:` marker, vulnerability table entry, or pinned vulnerable dependency is fixed, removed, or weakened by this plan.
- [x] **II. Documented Vulnerability Lifecycle** — not applicable because this feature is not intended to introduce a vulnerability.
- [x] **III. Monorepo Workspace Boundaries** — changes stay inside existing `packages/api` and `packages/web` workspaces; no path options added to `tsconfig.base.json`.
- [x] **IV. Fault-Tolerant Runtime Configuration** — no new optional external credential is introduced.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — implementation can fix inventory-specific bugs without hardening unrelated intentional vulnerabilities.

## Project Structure

### Documentation (this feature)

```text
specs/011-inventory-management/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/models/Product.ts
├── api/src/models/StockMovement.ts
├── api/src/services/InventoryService.ts
├── api/src/api/v3/inventory.ts
├── api/src/api/v3/orders.ts
├── api/tests/unit/inventory.test.ts
├── web/src/adminPages.tsx
└── web/src/cartPage.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |