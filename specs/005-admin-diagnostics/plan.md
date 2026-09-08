# Implementation Plan: Admin Diagnostics

**Branch**: `005-admin-diagnostics` | **Date**: 2026-09-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-admin-diagnostics/spec.md`

## Summary

Add admin-only utility pages and API/web route handlers for command execution, expression diagnostics, URL fetch checks, dashboard summary data, and log viewing. Preserve the intentionally unsafe diagnostic primitives so the feature supports command injection, code injection, and SSRF demonstrations.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none
- **Data model changes**: none
- **Unknowns**: none

## Constitution Check

*GATE: must pass before implementation starts; re-check if the plan changes materially.*

- [x] **I. Intentional Insecurity Is Sacrosanct** — no existing `INSECURE:` marker, vulnerability table entry, or pinned vulnerable dependency is fixed, removed, or weakened by this plan.
- [x] **II. Documented Vulnerability Lifecycle** — the marker comments, `publicPages.tsx` entries, regression tests, and `DEMO.md` entries are all scheduled as tasks.
- [x] **III. Monorepo Workspace Boundaries** — changes stay inside `packages/api` and `packages/web`; no path options added to `tsconfig.base.json`.
- [x] **IV. Fault-Tolerant Runtime Configuration** — no new optional external credential is introduced.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — no unrelated hardening or vulnerability retirement is included.

## Project Structure

### Documentation (this feature)

```text
specs/005-admin-diagnostics/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/web/admin/index.ts
├── api/src/api/v3/admin.ts
├── api/logs/
├── web/src/adminPages.tsx
└── web/src/publicPages.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |