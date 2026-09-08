# Implementation Plan: User Messaging

**Branch**: `007-messaging` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-messaging/spec.md`

## Summary

Build a lightweight account messaging workflow with message persistence, API endpoints for create/list/read/unread-count operations, account UI views, and admin visibility. Preserve intentionally unsafe message rendering so the feature supports the stored-XSS demo and its documentation trail.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none
- **Data model changes**: Add message persistence with sender/recipient and read/unread state.
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
specs/007-messaging/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/models/Message.ts
├── api/src/services/MessageService.ts
├── api/src/api/v3/messages.ts
├── web/src/accountPages.tsx
├── web/src/adminPages.tsx
└── web/src/publicPages.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |