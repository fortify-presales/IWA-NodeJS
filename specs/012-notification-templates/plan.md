# Implementation Plan: Notification Templates

**Branch**: `012-notification-templates` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-notification-templates/spec.md`

## Summary

Add editable notification templates for administrators, preview rendering, and integration points for existing email/SMS services. Preserve intentionally unsafe template rendering and header handling for training scenarios while documenting the vulnerability lifecycle.

## Technical Context

- **Affected packages**: `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: template rendering dependency if not already present
- **Data model changes**: Add notification template persistence with category, channel, subject/body, and update metadata.
- **Unknowns**: none

## Constitution Check

*GATE: must pass before implementation starts; re-check if the plan changes materially.*

- [x] **I. Intentional Insecurity Is Sacrosanct** — no existing `INSECURE:` marker, vulnerability table entry, or pinned vulnerable dependency is fixed, removed, or weakened by this plan.
- [x] **II. Documented Vulnerability Lifecycle** — the marker comments, `publicPages.tsx` entries, regression tests, and `DEMO.md` entries are scheduled as tasks.
- [x] **III. Monorepo Workspace Boundaries** — changes stay inside existing `packages/api` and `packages/web` workspaces; no path options added to `tsconfig.base.json`.
- [x] **IV. Fault-Tolerant Runtime Configuration** — no new optional external credential is introduced; notification delivery uses existing configuration behavior.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — no unrelated hardening or vulnerability retirement is included.

## Project Structure

### Documentation (this feature)

```text
specs/012-notification-templates/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── api/src/models/NotificationTemplate.ts
├── api/src/services/NotificationTemplateService.ts
├── api/src/services/EmailService.ts
├── api/src/services/SmsService.ts
├── api/src/api/v3/admin.ts
├── api/tests/vulnerabilities/notificationTemplates.test.ts
├── web/src/adminPages.tsx
└── web/src/publicPages.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |