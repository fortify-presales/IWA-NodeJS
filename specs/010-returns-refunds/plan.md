# Implementation Plan: Returns and Refunds

**Branch**: `010-returns-refunds` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-returns-refunds/spec.md`

## Summary

Add return request and refund processing workflows tied to existing order history and admin operations. Preserve intentionally vulnerable ownership, output rendering, and refund-amount behavior for training scenarios.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none expected
- **Data model changes**: Add return request and refund persistence associated with orders, users, and products.
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
specs/010-returns-refunds/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/models/ReturnRequest.ts
├── api/src/models/Refund.ts
├── api/src/services/ReturnService.ts
├── api/src/api/v3/returns.ts
├── api/tests/vulnerabilities/returnsRefunds.test.ts
├── web/src/accountPages.tsx
├── web/src/adminPages.tsx
└── web/src/publicPages.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |