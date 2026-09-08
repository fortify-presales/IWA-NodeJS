# Tasks: Order Management

**Input**: Design documents from `specs/004-order-management/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II.

## Phase 1: Setup

- [x] T001 Add order API route registration in `packages/api/src/api/v3/orders.ts`

## Phase 2: Foundational (blocking prerequisites)

- [x] T002 Add order persistence model in `packages/api/src/models/Order.ts`
- [x] T003 Add order repository access in `packages/api/src/repositories/OrderRepository.ts`
- [x] T004 Add order lifecycle logic in `packages/api/src/services/OrderService.ts`

## Phase 3: Core Implementation

- [x] T005 [P] Add cart checkout order creation flow in `packages/web/src/cartPage.tsx`
- [x] T006 [P] Add account order history/detail view in `packages/web/src/accountPages.tsx`
- [x] T007 [P] Add admin order visibility in `packages/web/src/adminPages.tsx`

## Phase 4: Vulnerability Documentation

- [x] T008 Add `INSECURE:`/`Purpose:`/`Fix:` marker comment above the vulnerable order access code
- [x] T009 Add IDOR table entry in `packages/web/src/publicPages.tsx`
- [x] T010 Add order IDOR regression coverage under `packages/api/tests/vulnerabilities/`
- [x] T011 Document exact IDOR payload and expected result in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T012 Confirm checkout/order flows do not require new external services
- [x] T013 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last