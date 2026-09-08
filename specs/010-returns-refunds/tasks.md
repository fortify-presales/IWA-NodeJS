# Tasks: Returns and Refunds

**Input**: Design documents from `specs/010-returns-refunds/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II.

## Phase 1: Setup

- [ ] T001 Add returns API route registration in `packages/api/src/api/v3/returns.ts`
- [ ] T002 Register returns routes from the API v3 router

## Phase 2: Foundational (blocking prerequisites)

- [ ] T003 Add return/refund persistence models in `packages/api/src/models/ReturnRequest.ts` and `packages/api/src/models/Refund.ts`
- [ ] T004 Add return request and refund processing logic in `packages/api/src/services/ReturnService.ts`

## Phase 3: Core Implementation

- [ ] T005 [P] Add account returns UI in `packages/web/src/accountPages.tsx`
- [ ] T006 [P] Add admin returns queue UI in `packages/web/src/adminPages.tsx`
- [ ] T007 Add API client helpers for returns/refunds in `packages/web/src/api.ts`
- [ ] T008 Add links from order history to eligible return requests

## Phase 4: Vulnerability Documentation

- [ ] T009 Add `INSECURE:`/`Purpose:`/`Fix:` marker comments above vulnerable returns/refunds code
- [ ] T010 Add returns/refunds vulnerability table entries in `packages/web/src/publicPages.tsx`
- [ ] T011 Add IDOR, over-refund, and stored-XSS tests in `packages/api/tests/vulnerabilities/returnsRefunds.test.ts`
- [ ] T012 Document exact returns/refunds payloads and expected results in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T013 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last