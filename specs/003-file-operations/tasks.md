# Tasks: File Operations

**Input**: Design documents from `specs/003-file-operations/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II.

## Phase 1: Setup

- [x] T001 Add upload, download, XML import, settings import, and backup restore route entries in `packages/api/src/web/user.ts`, `packages/api/src/api/v3/account.ts`, and `packages/api/src/web/admin/index.ts`

## Phase 2: Foundational (blocking prerequisites)

- [x] T002 Add file storage helpers in `packages/api/src/services/StorageService.ts`
- [x] T003 Ensure runtime upload/restore directories exist under `packages/api/data/` or cwd-relative data paths

## Phase 3: Core Implementation

- [x] T004 [P] Add account upload/download/import pages in `packages/web/src/accountPages.tsx`
- [x] T005 [P] Add admin backup restore flow in `packages/web/src/adminPages.tsx`
- [x] T006 Wire API upload/download/import behavior in `packages/api/src/api/v3/account.ts`

## Phase 4: Vulnerability Documentation

- [x] T007 Add `INSECURE:`/`Purpose:`/`Fix:` marker comments above vulnerable file-handling code
- [x] T008 Add table entries in `packages/web/src/publicPages.tsx`
- [x] T009 Add path traversal regression test in `packages/api/tests/vulnerabilities/pathTraversal.test.ts`
- [x] T010 Document exact path traversal, XXE, deserialization, and restore payloads in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T011 Confirm uploaded demo data paths remain ignored and do not add generated files to source control
- [x] T012 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last