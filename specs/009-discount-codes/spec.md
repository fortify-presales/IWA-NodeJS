# Feature Specification: Discount Codes and Promotions

**Status**: Draft | **Branch**: `009-discount-codes` | **Date**: 2026-09-08
**Input**: Future feature request to add discount codes and promotional checkout pricing.

## Overview

Store administrators need to create promotional discount codes, and customers need to apply valid codes during checkout. The feature adds discount-code persistence, admin management screens, checkout code validation, and order total adjustments.

## Is this an intentional vulnerability demonstration?

- [ ] No — this is a normal feature/fix.
- [x] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle). If yes, fill in:
  - **CWE**: CWE-89, CWE-639, CWE-79
  - **Purpose**: Demonstrates SQL injection in promotion search, authorization bypass in discount redemption, and stored XSS in promotion descriptions.
  - **Fix**: A production app would use parameterized queries, enforce promotion eligibility and role checks, and encode or sanitize promotion descriptions.
  - Confirms: `publicPages.tsx` table entry, regression test under `packages/api/tests/vulnerabilities/`, and a `DEMO.md` entry with exact payloads are all planned in this spec's tasks.

## User Scenarios

### Primary scenario

Given a customer has items in their cart, when they apply a valid discount code, then the checkout total reflects the discount.

### Additional scenarios

- Given an administrator creates a discount code, when customers meet its criteria, then it can be redeemed during checkout.
- Given an administrator searches promotions, when matching codes exist, then the admin list is filtered.
- Given a discount code is expired or over its usage limit, when a customer applies it, then checkout displays a rejection message.

### Edge cases

- Discount values cannot reduce an order below zero.
- Duplicate discount codes are rejected.

## Functional Requirements

- **FR-001**: The system MUST allow administrators to create, edit, and list discount codes.
- **FR-002**: The system MUST allow customers to apply discount codes during checkout.
- **FR-003**: The system MUST persist discount amount/type, expiry, usage limit, and description fields.
- **FR-004**: The system MUST update order totals when a discount is applied.
- **FR-005**: The system MUST expose promotion search/filter behavior for administrators.
- **FR-006**: The intentional discount-code vulnerability behaviors MUST be documented and covered by regression tests.

## Out of Scope

- Payment-provider coupons, campaign analytics, and customer segmentation rules.

## Success Criteria

- **SC-001**: An administrator can create a discount code and see it in the admin promotion list.
- **SC-002**: A customer can apply a valid code and see the adjusted checkout total.
- **SC-003**: SQL injection, authorization-bypass, and stored-XSS payloads are reproducible from `DEMO.md`.

## Affected Packages

- [ ] `packages/shared` — Not required initially.
- [ ] `packages/agent` — Not required for this feature.
- [x] `packages/api` — Discount model, service, admin/customer APIs, and order total integration.
- [x] `packages/web` — Admin promotion pages and checkout discount UI.