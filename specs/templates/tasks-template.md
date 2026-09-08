# Tasks: [FEATURE NAME]

**Input**: Design documents from `specs/[###-feature-slug]/` (`spec.md`, `plan.md`)
**Tests**: Include test tasks only if requested in the spec or required by Constitution Principle II
(vulnerability regression tests are always required for intentional vulnerabilities).

## Format

`- [ ] [TaskID] [P?] Description with exact file path`

- **Checkbox**: always `- [ ]`
- **Task ID**: sequential, e.g. `T001`, `T002`, ...
- **[P]**: include only if the task touches different files with no dependency on an incomplete task
- **Description**: a concrete action naming the exact file(s) to create/edit

## Phase 1: Setup

- [ ] T001 [describe project/package setup needed, e.g. add a new route file]

## Phase 2: Foundational (blocking prerequisites)

- [ ] T002 [shared types/models other tasks depend on, e.g. `packages/shared/src/...`]

## Phase 3: Core Implementation

- [ ] T003 [P] [implementation task 1 — file path]
- [ ] T004 [P] [implementation task 2 — file path]

## Phase 4: Vulnerability Documentation *(only if this feature adds an intentional vulnerability)*

- [ ] T005 Add `INSECURE:`/`Purpose:`/`Fix:` marker comment above the vulnerable code
- [ ] T006 Add table entry in `packages/web/src/publicPages.tsx`
- [ ] T007 Add regression test in `packages/api/tests/vulnerabilities/`
- [ ] T008 Document exact payload and expected result in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T009 Update `README.md`/`.env.example` if new env vars or scripts were introduced
- [ ] T010 Run `npm run build` and `npm run lint` from repo root; fix any resulting errors

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4 (if applicable)
- Phase 5 runs last
