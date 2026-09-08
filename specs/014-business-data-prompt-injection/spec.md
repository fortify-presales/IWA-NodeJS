# Feature Specification: Indirect Prompt Injection Through Business Data

**Status**: Implemented | **Branch**: `014-business-data-prompt-injection` | **Date**: 2026-09-08
**Input**: FAA demonstration request for data-to-instruction trust-boundary analysis

## Overview

Add a `search_products` agent tool that returns product descriptions directly into the model context. Product descriptions are attacker-controlled business data, so embedded instructions can influence later model behavior and tool calls. This complements the existing `fetch_url` example with a deterministic application-data source.

## Is this an intentional vulnerability demonstration?

- [x] Yes — see Constitution Principle II.
  - **CWE**: CWE-1427
  - **Purpose**: Demonstrates indirect prompt injection when untrusted product data is treated as model instructions.
  - **Fix**: Label retrieved content as untrusted data, separate it from instructions, and prevent tool output from authorizing further actions.
  - **Confirms**: `publicPages.tsx`, a regression test, and `DEMO.md` are updated.

## User Scenarios

### Primary scenario

Given a product description containing attacker-controlled instructions, when a user asks the assistant to search products, then the description is returned to the model as raw context and can influence subsequent tool selection.

### Additional scenarios

- Given normal product descriptions, when the assistant searches by keyword, then product names and descriptions are returned in a structured result.

### Edge cases

- Descriptions containing imperative text are not escaped, labeled, or filtered before they are returned to the model.

## Functional Requirements

- **FR-001**: The agent MUST expose a `search_products` tool.
- **FR-002**: The tool MUST return product descriptions without a trusted/untrusted data boundary.
- **FR-003**: The API callback MUST source results from the product repository.
- **FR-004**: The vulnerability MUST be marked in source and documented with an exact payload.

## Out of Scope

- Conversation persistence or multi-turn prompt poisoning.
- Production content moderation or prompt-hardening remediation.

## Success Criteria

- **SC-001**: A regression test proves an instruction embedded in a product description reaches the tool result.
- **SC-002**: The web catalog and `DEMO.md` identify the scenario as FAA coverage.

## Affected Packages

- [ ] `packages/shared`
- [x] `packages/agent` — tool and agent registration.
- [x] `packages/api` — product repository callback and vulnerable trust boundary.
- [x] `packages/web` — vulnerability catalog.
