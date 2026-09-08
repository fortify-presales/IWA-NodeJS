# Tasks: User Messaging

**Input**: Design documents from `specs/007-messaging/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II.

## Phase 1: Setup

- [x] T001 Add message API route registration in `packages/api/src/api/v3/messages.ts`

## Phase 2: Foundational (blocking prerequisites)

- [x] T002 Add message persistence model in `packages/api/src/models/Message.ts`
- [x] T003 Add message create/list/read/unread-count logic in `packages/api/src/services/MessageService.ts`

## Phase 3: Core Implementation

- [x] T004 [P] Add account messages UI in `packages/web/src/accountPages.tsx`
- [x] T005 [P] Add admin messages UI in `packages/web/src/adminPages.tsx`
- [x] T006 Add unread count integration for account message state

## Phase 4: Vulnerability Documentation

- [x] T007 Add `INSECURE:`/`Purpose:`/`Fix:` marker comment above vulnerable message rendering code
- [x] T008 Add stored-XSS table entry in `packages/web/src/publicPages.tsx`
- [x] T009 Add or confirm stored-XSS regression coverage under `packages/api/tests/vulnerabilities/`
- [x] T010 Document exact message stored-XSS payload and expected result in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T011 Confirm no new environment variables or external services are required
- [x] T012 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last