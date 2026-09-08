# Feature Specification: Notification Templates

**Status**: Draft | **Branch**: `012-notification-templates` | **Date**: 2026-09-08
**Input**: Future feature request to add editable email and SMS notification templates.

## Overview

Administrators need to customize notification templates for order confirmations, shipping updates, password reset messages, and account notifications. The feature adds template persistence, an admin editor, preview rendering, and integration with existing notification services.

## Is this an intentional vulnerability demonstration?

- [ ] No — this is a normal feature/fix.
- [x] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle). If yes, fill in:
  - **CWE**: CWE-1336, CWE-148, CWE-200
  - **Purpose**: Demonstrates server-side template injection, email header injection, and information exposure through raw notification previews.
  - **Fix**: A production app would use a constrained template language, validate email headers, sandbox rendering, and avoid previewing sensitive token values.
  - Confirms: `publicPages.tsx` table entry, regression test under `packages/api/tests/vulnerabilities/`, and a `DEMO.md` entry with exact payloads are all planned in this spec's tasks.

## User Scenarios

### Primary scenario

Given an authenticated administrator, when they edit an order confirmation template, then future order notifications use the updated content.

### Additional scenarios

- Given an administrator opens a template preview, when sample data is provided, then the rendered email/SMS body is displayed.
- Given a password reset notification template exists, when a reset is requested, then the template is applied to the generated message.
- Given a template has placeholders, when it is rendered, then placeholders are replaced with supplied notification data.

### Edge cases

- Empty template names or bodies are rejected with validation feedback.
- Missing placeholder values render predictably without crashing the API.

## Functional Requirements

- **FR-001**: The system MUST allow administrators to list and edit notification templates.
- **FR-002**: The system MUST support templates for order, shipping, password reset, and account notification categories.
- **FR-003**: The system MUST render template previews with supplied or sample data.
- **FR-004**: Existing email/SMS services MUST use stored templates when sending supported notifications.
- **FR-005**: The system MUST preserve version/update metadata for templates.
- **FR-006**: The intentional notification-template vulnerability behaviors MUST be documented and covered by regression tests.

## Out of Scope

- WYSIWYG editors, localization, delivery analytics, unsubscribe management, and external ESP integration.

## Success Criteria

- **SC-001**: An administrator can edit a template and preview rendered output.
- **SC-002**: Supported notification sends use the stored template content.
- **SC-003**: SSTI, header-injection, and preview information-exposure payloads are reproducible from `DEMO.md`.

## Affected Packages

- [ ] `packages/shared` — Not required initially.
- [ ] `packages/agent` — Not required for this feature.
- [x] `packages/api` — Template model, admin APIs, preview rendering, and notification service integration.
- [x] `packages/web` — Admin template editor and vulnerability documentation UI.