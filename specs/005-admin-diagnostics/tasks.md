# Tasks: Admin Diagnostics

**Input**: Design documents from `specs/005-admin-diagnostics/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II.

## Phase 1: Setup

- [x] T001 Add admin diagnostic route entries in `packages/api/src/web/admin/index.ts`
- [x] T002 Add admin summary API route in `packages/api/src/api/v3/admin.ts`

## Phase 2: Foundational (blocking prerequisites)

- [x] T003 Confirm admin routes use existing authentication and role middleware
- [x] T004 Confirm log file locations resolve from the API package runtime cwd

## Phase 3: Core Implementation

- [x] T005 [P] Add command shell page in `packages/web/src/adminPages.tsx`
- [x] T006 [P] Add diagnostics page for expression evaluation and URL fetch in `packages/web/src/adminPages.tsx`
- [x] T007 [P] Add log viewer and admin dashboard summary UI in `packages/web/src/adminPages.tsx`

## Phase 4: Vulnerability Documentation

- [x] T008 Add `INSECURE:`/`Purpose:`/`Fix:` marker comments above vulnerable diagnostic code
- [x] T009 Add command injection, code injection, and SSRF table entries in `packages/web/src/publicPages.tsx`
- [x] T010 Add admin diagnostic regression coverage under `packages/api/tests/vulnerabilities/`
- [x] T011 Document exact diagnostic payloads and expected results in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T012 Confirm no new environment variables or external services are required
- [x] T013 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last