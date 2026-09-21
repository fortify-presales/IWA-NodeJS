# Tasks: Consolidated Agent Tool Expansion

**Input**: `spec.md` and `plan.md`

## Phase 1: Core Implementation

- [x] T001 Add review and file-download dependency types and tool factories under `packages/agent/src/tools/`.
- [x] T002 Register the new tools in `packages/agent/src/AgentService.ts`.
- [x] T003 Refactor `packages/api/src/api/v3/agent.ts` to construct and delegate to `AgentService`.

## Phase 2: Vulnerability Documentation

- [x] T004 Preserve intentional-vulnerability markers above the new API callbacks.
- [x] T005 Add regression tests under `packages/api/tests/vulnerabilities/`.
- [x] T006 Add exact payloads and expected results to `DEMO.md`.
- [x] T007 Add entries to `packages/web/src/publicPages.tsx`.

## Phase 3: Validation

- [x] T008 Build the workspace and run focused agent/API tests.
- [x] T009 Run the repository SAST scan and record the result.
