# Implementation Plan: Agentic Excessive Agency

**Branch**: `013-agentic-excessive-agency` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

## Summary

Add a state-changing order tool to the agent and wire it to an intentionally unprotected API callback. Preserve the existing agent architecture while making the missing approval and caller-context boundary explicit for FAA.

## Technical Context

- **Affected packages**: `@iwa/agent`, `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none
- **Data model changes**: Add `shippingAddress` to `Order`.
- **Unknowns**: none

## Constitution Check

- [x] **I. Intentional Insecurity Is Sacrosanct** — existing demonstrations remain unchanged.
- [x] **II. Documented Vulnerability Lifecycle** — marker, catalog entry, regression test, and `DEMO.md` entry are included.
- [x] **III. Monorepo Workspace Boundaries** — agent builds before API; no shared path configuration changes.
- [x] **IV. Fault-Tolerant Runtime Configuration** — no new credentials.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — the missing approval is intentional, not fixed.

## Implementation Tasks

- Add the tool interface and export.
- Add the order field and API callback with the required marker.
- Register the tool in `AgentService` and advertise it in the system prompt.
- Add regression coverage and update the catalog and walkthrough.
