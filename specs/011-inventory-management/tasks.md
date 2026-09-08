# Tasks: Inventory Management

**Input**: Design documents from `specs/011-inventory-management/` (`spec.md`, `plan.md`)
**Tests**: Include focused unit/integration tests because this feature changes checkout behavior.

## Phase 1: Setup

- [ ] T001 Add inventory API route registration in `packages/api/src/api/v3/inventory.ts`
- [ ] T002 Register inventory routes from the API v3 router

## Phase 2: Foundational (blocking prerequisites)

- [ ] T003 Add stock fields to `packages/api/src/models/Product.ts`
- [ ] T004 Add stock movement persistence model in `packages/api/src/models/StockMovement.ts`
- [ ] T005 Add inventory adjustment and stock decrement logic in `packages/api/src/services/InventoryService.ts`

## Phase 3: Core Implementation

- [ ] T006 Add stock checks/decrements to checkout/order creation code in `packages/api/src/api/v3/orders.ts` and related order service code
- [ ] T007 [P] Add admin inventory management UI in `packages/web/src/adminPages.tsx`
- [ ] T008 [P] Add checkout stock feedback in `packages/web/src/cartPage.tsx`
- [ ] T009 Add API client helpers for inventory operations in `packages/web/src/api.ts`

## Phase 4: Tests

- [ ] T010 Add inventory adjustment tests in `packages/api/tests/unit/inventory.test.ts`
- [ ] T011 Add checkout stock decrement and insufficient-stock tests in the relevant API test suite
- [ ] T012 Add a concurrent checkout test that verifies stock cannot go negative

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T013 Confirm inventory APIs require admin role checks where appropriate
- [ ] T014 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last