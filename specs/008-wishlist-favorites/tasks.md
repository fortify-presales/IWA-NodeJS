# Tasks: Wishlist and Favorites

**Input**: Design documents from `specs/008-wishlist-favorites/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II.

## Phase 1: Setup

- [ ] T001 Add wishlist API route registration in `packages/api/src/api/v3/wishlist.ts`
- [ ] T002 Register the wishlist route from the API v3 router

## Phase 2: Foundational (blocking prerequisites)

- [ ] T003 Add wishlist persistence models in `packages/api/src/models/Wishlist.ts` and `packages/api/src/models/WishlistItem.ts`
- [ ] T004 Add wishlist business logic in `packages/api/src/services/WishlistService.ts`

## Phase 3: Core Implementation

- [ ] T005 [P] Add product-page wishlist controls in `packages/web/src/products.tsx` or the owning product detail surface
- [ ] T006 [P] Add account wishlist management UI in `packages/web/src/accountPages.tsx`
- [ ] T007 Add API client helpers for wishlist operations in `packages/web/src/api.ts`

## Phase 4: Vulnerability Documentation

- [ ] T008 Add `INSECURE:`/`Purpose:`/`Fix:` marker comments above vulnerable wishlist access/rendering code
- [ ] T009 Add wishlist vulnerability table entries in `packages/web/src/publicPages.tsx`
- [ ] T010 Add wishlist XSS and IDOR regression tests in `packages/api/tests/vulnerabilities/wishlist.test.ts`
- [ ] T011 Document exact wishlist payloads and expected results in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T012 Run build/test checks for the touched API and web packages

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last