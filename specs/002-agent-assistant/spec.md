# Feature Specification: Conversational AI Assistant

**Status**: Draft | **Branch**: `002-agent-assistant` | **Date**: 2026-09-02
**Input**: Historical feature request to add an LLM assistant with order lookup and web fetch tools.

## Overview

Shoppers and support users need an assistant that can answer store questions and perform limited tool-backed lookups. The feature adds shared chat types, an agent package, an authenticated API endpoint, and a React assistant page.

## Is this an intentional vulnerability demonstration?

- [ ] No — this is a normal feature/fix.
- [x] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle). If yes, fill in:
  - **CWE**: CWE-1427, CWE-639, CWE-918, CWE-79
  - **Purpose**: Demonstrates LLM prompt injection, excessive agency/IDOR through tool calls, SSRF through unrestricted URL fetch, and insecure rendering of model output.
  - **Fix**: A production app would isolate user input from system instructions, enforce authorization checks in tools, restrict outbound fetch destinations, and encode or sanitize model output before rendering.
  - Confirms: `publicPages.tsx` table entry, regression tests under `packages/api/tests/vulnerabilities/`, and `DEMO.md` entries with exact payloads are all planned in this spec's tasks.

## User Scenarios

### Primary scenario

Given an authenticated user on the assistant page, when they ask a shopping or order-related question, then the assistant returns a conversational response.

### Additional scenarios

- Given the assistant needs order context, when it invokes the order lookup tool, then the API returns order information to include in the response.
- Given the assistant needs external content, when it invokes the URL fetch tool, then the fetched content is available to the model response.
- Given `OPENAI_API_KEY` is not configured, when the assistant endpoint is called, then only that request fails with a clear configuration error.

### Edge cases

- Empty prompts are rejected before invoking the model.
- Third-party credential absence does not crash app startup or unrelated API tests.

## Functional Requirements

- **FR-001**: The system MUST define shared chat request/response types for the assistant API.
- **FR-002**: The system MUST expose an authenticated `POST /api/v3/agent/chat` endpoint.
- **FR-003**: The system MUST construct the OpenAI-backed agent lazily so missing credentials do not fail process startup.
- **FR-004**: The assistant MUST support order lookup and URL fetch tools.
- **FR-005**: Users MUST be able to access the assistant from the React app at `/app/assistant`.
- **FR-006**: The intentional AI vulnerability behaviors MUST be documented and covered by regression tests.

## Out of Scope

- Streaming responses, persistent conversation history, and production safety controls.
- Provider-agnostic model configuration beyond the current OpenAI-backed demo.

## Success Criteria

- **SC-001**: A configured environment can submit a chat prompt and receive an assistant response.
- **SC-002**: Missing `OPENAI_API_KEY` fails only assistant requests and leaves unrelated app routes importable/testable.
- **SC-003**: Prompt injection, excessive agency, SSRF, and insecure-output payloads are reproducible from `DEMO.md`.

## Affected Packages

- [x] `packages/shared` — Shared assistant request/response contracts.
- [x] `packages/agent` — LangChain/OpenAI agent service, system prompt, and tools.
- [x] `packages/api` — Authenticated assistant API endpoint and tool wiring.
- [x] `packages/web` — Assistant page and vulnerability documentation UI.