# Feature Specification: Agentic Excessive Agency Demonstration

**Status**: Implemented | **Branch**: `013-agentic-excessive-agency` | **Date**: 2026-09-08
**Input**: FAA demonstration request for a model-controlled sensitive action

## Overview

Add a deliberately vulnerable `change_shipping_address` agent tool to demonstrate excessive agency. The tool lets the model perform a state-changing order action without explicit user confirmation or an independent authorization check, giving FAA a model-to-action trust-boundary example beyond ordinary IDOR scanning.

## Is this an intentional vulnerability demonstration?

- [x] Yes — see Constitution Principle II.
  - **CWE**: CWE-862
  - **Purpose**: Demonstrates an LLM agent performing a sensitive state-changing action without approval or caller-context authorization.
  - **Fix**: Require explicit user confirmation, pass authenticated identity into the operation, and enforce ownership and role checks server-side.
  - **Confirms**: `publicPages.tsx`, a regression test, and `DEMO.md` are updated.

## User Scenarios

### Primary scenario

Given an authenticated assistant user, when they ask the model to change an order shipping address, then the model can invoke the tool and the API updates the order without a confirmation step.

### Additional scenarios

- Given an order ID belonging to another user, when the model requests an address change, then the callback has no caller context with which to enforce ownership.

### Edge cases

- Unknown order IDs return the tool callback's normal update result because the demonstration intentionally does not add a protective existence or ownership check.

## Functional Requirements

- **FR-001**: The agent MUST expose a `change_shipping_address` tool.
- **FR-002**: The tool MUST accept an order ID and address and invoke the API callback without a confirmation parameter.
- **FR-003**: The API callback MUST update the order without an authenticated-user ownership check.
- **FR-004**: The vulnerability MUST be marked in source and documented with an exact payload.

## Out of Scope

- Human approval UI or production authorization remediation.
- Conversation persistence or multi-turn state.

## Success Criteria

- **SC-001**: A regression test proves the tool callback is invoked directly with attacker-controlled order and address values.
- **SC-002**: The web catalog and `DEMO.md` identify the scenario as FAA coverage.

## Affected Packages

- [ ] `packages/shared`
- [x] `packages/agent` — tool and agent dependency interface.
- [x] `packages/api` — order field and vulnerable callback wiring.
- [x] `packages/web` — vulnerability catalog.
