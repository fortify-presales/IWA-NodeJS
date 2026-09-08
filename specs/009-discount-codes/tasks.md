# Tasks: Discount Codes and Promotions

**Input**: Design documents from `specs/009-discount-codes/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II.

## Phase 1: Setup

- [ ] T001 Add discount API route registration in `packages/api/src/api/v3/discounts.ts`
- [ ] T002 Register discount routes from the API v3 router

## Phase 2: Foundational (blocking prerequisites)

- [ ] T003 Add discount persistence model in `packages/api/src/models/DiscountCode.ts`
- [ ] T004 Add discount validation, redemption, and search logic in `packages/api/src/services/DiscountService.ts`
- [ ] T005 Add order total integration in `packages/api/src/api/v3/orders.ts` and related order service code

## Phase 3: Core Implementation

- [ ] T006 [P] Add checkout discount entry and total display in `packages/web/src/cartPage.tsx`
- [ ] T007 [P] Add admin discount management UI in `packages/web/src/adminPages.tsx`
- [ ] T008 Add API client helpers for discount operations in `packages/web/src/api.ts`

## Phase 4: Vulnerability Documentation

- [ ] T009 Add `INSECURE:`/`Purpose:`/`Fix:` marker comments above vulnerable discount-code code
- [ ] T010 Add discount-code vulnerability table entries in `packages/web/src/publicPages.tsx`
- [ ] T011 Add SQL injection, redemption bypass, and stored-XSS tests in `packages/api/tests/vulnerabilities/discountCodes.test.ts`
- [ ] T012 Document exact discount-code payloads and expected results in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T013 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last