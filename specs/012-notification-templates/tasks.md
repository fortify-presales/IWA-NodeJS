# Tasks: Notification Templates

**Input**: Design documents from `specs/012-notification-templates/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II.

## Phase 1: Setup

- [ ] T001 Add notification template admin route entries in `packages/api/src/api/v3/admin.ts` or a dedicated admin template route
- [ ] T002 Add admin template page routing in `packages/web/src/adminPages.tsx`

## Phase 2: Foundational (blocking prerequisites)

- [ ] T003 Add notification template persistence model in `packages/api/src/models/NotificationTemplate.ts`
- [ ] T004 Add template rendering and preview logic in `packages/api/src/services/NotificationTemplateService.ts`
- [ ] T005 Integrate stored templates with `packages/api/src/services/EmailService.ts` and `packages/api/src/services/SmsService.ts`

## Phase 3: Core Implementation

- [ ] T006 Add admin template list/editor UI in `packages/web/src/adminPages.tsx`
- [ ] T007 Add template preview UI and API client helpers in `packages/web/src/adminPages.tsx` and `packages/web/src/api.ts`
- [ ] T008 Add default templates through seed data or service fallback behavior

## Phase 4: Vulnerability Documentation

- [ ] T009 Add `INSECURE:`/`Purpose:`/`Fix:` marker comments above vulnerable template rendering/header/preview code
- [ ] T010 Add notification-template vulnerability table entries in `packages/web/src/publicPages.tsx`
- [ ] T011 Add SSTI, header-injection, and information-exposure tests in `packages/api/tests/vulnerabilities/notificationTemplates.test.ts`
- [ ] T012 Document exact notification-template payloads and expected results in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T013 Confirm no new optional delivery credentials can crash API startup
- [ ] T014 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last