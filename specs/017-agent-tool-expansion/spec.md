# Feature Specification: Consolidated Agent Tool Expansion

**Status**: Implementing | **Branch**: `017-agent-tool-expansion` | **Date**: 2026-09-21
**Input**: Consolidate the live API agent around `AgentService` and add review-persistence and file-download tools for FAA/DAST demonstrations.

## Overview

The live agent route currently duplicates the LangChain orchestration implemented by `AgentService`. This feature makes `AgentService` the single runtime owner and adds two intentionally vulnerable tools that demonstrate model-controlled persistence and filesystem access.

## Is this an intentional vulnerability demonstration?

- [x] Yes — see Constitution Principle II.
  - **CWE**: CWE-79/CWE-1427 and CWE-22/CWE-862
  - **Purpose**: Demonstrate model-controlled stored content and model-controlled path traversal for FAA/DAST.
  - **Fix**: Validate and authorize tool actions, isolate untrusted model content, sanitize output, and constrain filesystem paths.
  - Confirms: vulnerability catalog, regression tests, and exact `DEMO.md` payloads are included in the implementation tasks.

## User Scenarios

### Primary scenario

Given an authenticated user and configured model, when the model requests `create_review` or `download_file`, then the shared `AgentService` executes the tool and records the call.

### Additional scenarios

- A review comment containing HTML is persisted through the existing review service without sanitization for stored-XSS demonstration.
- A traversal filename is passed to the storage service with traversal enabled for file-disclosure demonstration.

### Edge cases

- Missing API key continues to return the existing 503 response.
- A missing review or file error follows the existing API error middleware.
- Unknown tool names remain represented as `Unknown tool` in the tool loop.

## Functional Requirements

- **FR-001**: The API agent route MUST delegate model and tool orchestration to `AgentService`.
- **FR-002**: `AgentService` MUST expose `create_review` and `download_file` in addition to the existing tools.
- **FR-003**: The new tools MUST use typed Zod schemas and dependency callbacks.
- **FR-004**: The intentional vulnerabilities MUST retain marker comments and MUST NOT be hardened as part of this feature.
- **FR-005**: Existing authentication, conversation IDs, tool-call records, and missing-key behavior MUST remain compatible.
- **FR-006**: Documentation, vulnerability catalog entries, and regression tests MUST describe both new demonstrations.

## Out of Scope

- Production remediation of the review, rendering, or storage vulnerabilities.
- LangGraph adoption or higher-level executor migration.
- Conversation persistence or approval workflows.

## Success Criteria

- **SC-001**: The API route contains no duplicate LangChain model/tool loop.
- **SC-002**: Focused tests prove both new tool callbacks receive the intended attacker-controlled values.
- **SC-003**: `npm run build` succeeds for the workspace.
- **SC-004**: FAA/DAST payloads are documented and can reach both new sinks.

## Affected Packages

- [ ] `packages/shared`
- [x] `packages/agent` — new tool contracts and unified registration.
- [x] `packages/api` — route consolidation and vulnerable callbacks/tests.
- [x] `packages/web` — vulnerability catalog entries.
