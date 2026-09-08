# Feature Specification: Admin Diagnostics

**Status**: Draft | **Branch**: `005-admin-diagnostics` | **Date**: 2026-09-05
**Input**: Historical feature request to add admin diagnostic utilities, command execution, URL fetch diagnostics, and log viewing.

## Overview

Administrators need operational troubleshooting tools to inspect runtime state, view logs, run diagnostics, and verify outbound connectivity. The feature adds admin-only diagnostic pages and routes for command execution, expression evaluation, URL fetching, dashboard summary data, and log review.

## Is this an intentional vulnerability demonstration?

- [ ] No — this is a normal feature/fix.
- [x] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle). If yes, fill in:
  - **CWE**: CWE-78, CWE-95, CWE-918
  - **Purpose**: Demonstrates command injection, code injection, and server-side request forgery in high-privilege admin utilities.
  - **Fix**: A production app would remove shell/eval capabilities, replace them with constrained diagnostic operations, and restrict outbound network destinations through an allow-list.
  - Confirms: `publicPages.tsx` table entry, regression tests under `packages/api/tests/vulnerabilities/`, and `DEMO.md` entries with exact payloads are all planned in this spec's tasks.

## User Scenarios

### Primary scenario

Given an authenticated administrator, when they open the diagnostics area, then they can run troubleshooting actions and inspect the output.

### Additional scenarios

- Given an administrator opens the log viewer, when logs exist, then recent log content is displayed.
- Given an administrator opens the dashboard, when summary data is requested, then counts and operational status are returned.
- Given outbound connectivity must be checked, when a diagnostic URL is submitted, then the response body or status is displayed.

### Edge cases

- Empty diagnostic inputs return validation feedback.
- Diagnostic command failures are captured and displayed without crashing the server process.

## Functional Requirements

- **FR-001**: The system MUST expose admin-only diagnostic routes and pages.
- **FR-002**: Administrators MUST be able to run a command-shell diagnostic and see output.
- **FR-003**: Administrators MUST be able to submit an expression diagnostic and see the result.
- **FR-004**: Administrators MUST be able to fetch a URL from the diagnostics page and see the response.
- **FR-005**: Administrators MUST be able to view recent log content and dashboard summary data.
- **FR-006**: The intentional admin diagnostic vulnerability behaviors MUST be documented and covered by regression tests.

## Out of Scope

- Production-grade observability, audit trails, command allow-lists, and external log aggregation.

## Success Criteria

- **SC-001**: An authenticated administrator can access command, diagnostic, log, and summary views.
- **SC-002**: Diagnostic failures return visible error output without unhandled process errors.
- **SC-003**: Command injection, eval injection, and SSRF demo payloads are reproducible from `DEMO.md`.

## Affected Packages

- [ ] `packages/shared` — Not required for this feature.
- [ ] `packages/agent` — Not required for this feature.
- [x] `packages/api` — Admin routes, diagnostic handlers, summary endpoint, and log access.
- [x] `packages/web` — Admin diagnostic pages, log page, dashboard, and vulnerability documentation UI.