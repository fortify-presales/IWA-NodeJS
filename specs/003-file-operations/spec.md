# Feature Specification: File Operations

**Status**: Draft | **Branch**: `003-file-operations` | **Date**: 2026-09-03
**Input**: Historical feature request to add account file upload, XML import, settings import, downloads, and admin backup restore workflows.

## Overview

Users need account-level file operations for uploads, downloads, XML imports, and settings import workflows. Administrators also need a backup restore path for operational demo scenarios.

## Is this an intentional vulnerability demonstration?

- [ ] No — this is a normal feature/fix.
- [x] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle). If yes, fill in:
  - **CWE**: CWE-22, CWE-611, CWE-502
  - **Purpose**: Demonstrates path traversal, XML external entity processing, insecure deserialization, and archive restore traversal risks in common file-handling workflows.
  - **Fix**: A production app would canonicalize and constrain paths, disable external XML entity resolution, avoid unsafe deserialization formats, and validate archive extraction paths.
  - Confirms: `publicPages.tsx` table entry, regression tests under `packages/api/tests/vulnerabilities/`, and `DEMO.md` entries with exact payloads are all planned in this spec's tasks.

## User Scenarios

### Primary scenario

Given an authenticated user in the account area, when they upload a file, then the file is stored and later available for download.

### Additional scenarios

- Given a user has an XML file, when they import it from the account area, then the server parses and displays the import result.
- Given a user has serialized settings, when they submit the settings import form, then the server restores the settings payload.
- Given an administrator has a backup archive, when they upload it to the backup restore page, then the server extracts the archive into the restore area.

### Edge cases

- Missing files or empty uploads return clear validation responses.
- Download requests for unknown files fail without crashing the app.

## Functional Requirements

- **FR-001**: The system MUST let authenticated users upload account files.
- **FR-002**: The system MUST let authenticated users download previously uploaded files.
- **FR-003**: The system MUST support XML file import from the account area.
- **FR-004**: The system MUST support serialized settings import from the account area.
- **FR-005**: The system MUST support administrator backup upload and restore.
- **FR-006**: The intentional file-handling vulnerability behaviors MUST be documented and covered by regression tests.

## Out of Scope

- Virus scanning, quota management, cloud object storage, and production archive validation.
- User-facing file sharing between accounts.

## Success Criteria

- **SC-001**: A logged-in user can upload and download a file from the account interface.
- **SC-002**: XML import, settings import, and backup restore demo payloads behave as documented.
- **SC-003**: File operation failures return controlled responses instead of unhandled process errors.

## Affected Packages

- [ ] `packages/shared` — Not required for this feature.
- [ ] `packages/agent` — Not required for this feature.
- [x] `packages/api` — Storage service, upload/download/import routes, and restore handling.
- [x] `packages/web` — Account/admin file-operation pages and vulnerability documentation UI.