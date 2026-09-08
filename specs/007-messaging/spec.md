# Feature Specification: User Messaging

**Status**: Draft | **Branch**: `007-messaging` | **Date**: 2026-09-07
**Input**: Historical feature request to add user-to-admin messaging with unread counts and read status.

## Overview

Users need a simple way to send account messages and track responses, while administrators need visibility into submitted messages. The feature adds message persistence, API endpoints, account/admin UI surfaces, unread counts, and read status behavior.

## Is this an intentional vulnerability demonstration?

- [ ] No — this is a normal feature/fix.
- [x] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle). If yes, fill in:
  - **CWE**: CWE-79
  - **Purpose**: Demonstrates stored cross-site scripting through message content rendered back in user and admin message views.
  - **Fix**: A production app would encode message content on output or sanitize it with an allow-list HTML policy before storage/display.
  - Confirms: `publicPages.tsx` table entry, regression test under `packages/api/tests/vulnerabilities/`, and a `DEMO.md` entry with exact payloads are all planned in this spec's tasks.

## User Scenarios

### Primary scenario

Given an authenticated user, when they submit a message from the account area, then the message is stored and appears in their message list.

### Additional scenarios

- Given a user has unread messages, when the account area requests the unread count, then the count reflects unread message state.
- Given a user opens a message, when it is displayed, then the message can be marked as read.
- Given an administrator opens the admin messages page, then messages across users are visible for review.

### Edge cases

- Empty message submissions are rejected with validation feedback.
- Requests for missing message IDs fail without crashing the API.

## Functional Requirements

- **FR-001**: The system MUST allow authenticated users to create messages.
- **FR-002**: The system MUST allow users to list and view their messages.
- **FR-003**: The system MUST track read/unread message state.
- **FR-004**: The system MUST expose unread count data for account UI badges or summaries.
- **FR-005**: Administrators MUST be able to view submitted messages from the admin area.
- **FR-006**: The intentional stored-XSS behavior MUST be documented and covered by a vulnerability regression test.

## Out of Scope

- Real-time chat, attachments, threaded conversations, email notifications, and moderation workflows.

## Success Criteria

- **SC-001**: A user can submit a message and see it in the account messages view.
- **SC-002**: Unread counts update when messages are created and read.
- **SC-003**: An administrator can view submitted messages.
- **SC-004**: The stored-XSS message payload and expected behavior are reproducible from `DEMO.md`.

## Affected Packages

- [ ] `packages/shared` — Not required for this feature.
- [ ] `packages/agent` — Not required for this feature.
- [x] `packages/api` — Message model, service, and API endpoints.
- [x] `packages/web` — Account/admin message views and vulnerability documentation UI.