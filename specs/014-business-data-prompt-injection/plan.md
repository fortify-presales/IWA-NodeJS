# Implementation Plan: Indirect Prompt Injection Through Business Data

**Branch**: `014-business-data-prompt-injection` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

## Summary

Add a product-search tool that returns product descriptions to the LLM without labeling them as untrusted data. The existing system prompt's instruction to follow tool-result instructions makes the data-to-instruction boundary demonstrable to FAA.

## Technical Context

- **Affected packages**: `@iwa/agent`, `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none
- **Data model changes**: none
- **Unknowns**: none

## Constitution Check

- [x] **I. Intentional Insecurity Is Sacrosanct** — existing demonstrations remain unchanged.
- [x] **II. Documented Vulnerability Lifecycle** — marker, catalog entry, regression test, and `DEMO.md` entry are included.
- [x] **III. Monorepo Workspace Boundaries** — agent builds before API; no shared path configuration changes.
- [x] **IV. Fault-Tolerant Runtime Configuration** — no new credentials.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — the trust-boundary weakness is intentional.

## Implementation Tasks

- Add the product search tool interface and export.
- Wire product repository results into the API agent dependencies with the required marker.
- Register and advertise the tool in `AgentService` and the system prompt.
- Add regression coverage and update the catalog and walkthrough.
