# Implementation Plan: File Operations

**Branch**: `003-file-operations` | **Date**: 2026-09-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-file-operations/spec.md`

## Summary

Add file storage and import workflows to the account area and backup restore capabilities to the admin area. Keep storage rooted in the API package runtime paths, reuse existing Express upload patterns, and preserve intentionally vulnerable behaviors for file-handling demonstrations.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: XML parsing, upload, serialization, and archive handling dependencies as needed by existing implementation
- **Data model changes**: none
- **Unknowns**: none

## Constitution Check

*GATE: must pass before implementation starts; re-check if the plan changes materially.*

- [x] **I. Intentional Insecurity Is Sacrosanct** — no existing `INSECURE:` marker, vulnerability table entry, or pinned vulnerable dependency is fixed, removed, or weakened by this plan.
- [x] **II. Documented Vulnerability Lifecycle** — the marker comments, `publicPages.tsx` entries, regression tests, and `DEMO.md` entries are all scheduled as tasks.
- [x] **III. Monorepo Workspace Boundaries** — runtime paths remain cwd-relative inside `packages/api`; no path options added to `tsconfig.base.json`.
- [x] **IV. Fault-Tolerant Runtime Configuration** — no new optional external credential is introduced.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — no unrelated hardening or vulnerability retirement is included.

## Project Structure

### Documentation (this feature)

```text
specs/003-file-operations/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/services/StorageService.ts
├── api/src/web/user.ts
├── api/src/api/v3/account.ts
├── api/src/web/admin/index.ts
├── api/tests/vulnerabilities/pathTraversal.test.ts
└── web/src/accountPages.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |