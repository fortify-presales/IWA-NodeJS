# Tasks: Product Reviews

**Input**: Design documents from `specs/001-product-reviews/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II.

## Phase 1: Setup

- [x] T001 Add review routing entry in `packages/api/src/api/v3/reviews.ts`

## Phase 2: Foundational (blocking prerequisites)

- [x] T002 Add review persistence model in `packages/api/src/models/Review.ts`
- [x] T003 Add review business logic in `packages/api/src/services/ReviewService.ts`

## Phase 3: Core Implementation

- [x] T004 [P] Add customer-facing review display/submission UI in `packages/web/src/publicPages.tsx`
- [x] T005 [P] Add account/admin review views in `packages/web/src/accountPages.tsx` and `packages/web/src/adminPages.tsx`

## Phase 4: Vulnerability Documentation

- [x] T006 Add `INSECURE:`/`Purpose:`/`Fix:` marker comment above the vulnerable review rendering code
- [x] T007 Add table entry in `packages/web/src/publicPages.tsx`
- [x] T008 Add stored-XSS regression test in `packages/api/tests/vulnerabilities/xss.test.ts`
- [x] T009 Document exact stored-XSS payload and expected result in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T010 Confirm no new environment variables or dependency updates are required
- [x] T011 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last