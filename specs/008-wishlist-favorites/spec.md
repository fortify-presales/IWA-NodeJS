# Feature Specification: Wishlist and Favorites

**Status**: Draft | **Branch**: `008-wishlist-favorites` | **Date**: 2026-09-08
**Input**: Future feature request to add wishlist and favorites management.

## Overview

Customers need a way to save products for later purchase and manage favorites from their account area. The feature adds wishlist persistence, product-page add/remove controls, account wishlist management, and optional shareable wishlist views.

## Is this an intentional vulnerability demonstration?

- [ ] No — this is a normal feature/fix.
- [x] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle). If yes, fill in:
  - **CWE**: CWE-79, CWE-639
  - **Purpose**: Demonstrates stored cross-site scripting through wishlist notes and insecure direct object reference through unrestricted wishlist access.
  - **Fix**: A production app would encode or sanitize wishlist notes and enforce owner/public-share authorization before returning wishlist data.
  - Confirms: `publicPages.tsx` table entry, regression test under `packages/api/tests/vulnerabilities/`, and a `DEMO.md` entry with exact payloads are all planned in this spec's tasks.

## User Scenarios

### Primary scenario

Given an authenticated customer viewing a product, when they add it to their wishlist, then it appears in their account wishlist for later purchase.

### Additional scenarios

- Given a customer has saved wishlist items, when they open the account wishlist page, then they can view and remove saved products.
- Given a customer adds a note to a wishlist item, when the wishlist is displayed, then the note appears alongside the product.
- Given a shared wishlist link exists, when another user opens it, then public wishlist details are displayed.

### Edge cases

- Adding the same product twice does not create duplicate active wishlist items.
- Removing an item that is not in the wishlist returns a controlled not-found response.

## Functional Requirements

- **FR-001**: The system MUST allow authenticated users to add products to a wishlist.
- **FR-002**: The system MUST allow users to list, update, and remove their wishlist items.
- **FR-003**: Product detail surfaces MUST expose add/remove wishlist actions.
- **FR-004**: Users MUST be able to attach optional notes to wishlist items.
- **FR-005**: The system MUST support shareable wishlist retrieval for demo scenarios.
- **FR-006**: The intentional wishlist XSS and IDOR behaviors MUST be documented and covered by regression tests.

## Out of Scope

- Price-drop notifications, collaborative wishlists, and inventory reservation.

## Success Criteria

- **SC-001**: A logged-in user can add a product to a wishlist and later remove it.
- **SC-002**: Wishlist items are visible from the account area.
- **SC-003**: Wishlist XSS and IDOR demo payloads are reproducible from `DEMO.md`.

## Affected Packages

- [ ] `packages/shared` — Not required initially.
- [ ] `packages/agent` — Not required for this feature.
- [x] `packages/api` — Wishlist models, services, and API endpoints.
- [x] `packages/web` — Product and account wishlist UI plus vulnerability documentation UI.