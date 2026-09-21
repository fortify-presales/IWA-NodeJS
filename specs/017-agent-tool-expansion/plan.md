# Implementation Plan: Consolidated Agent Tool Expansion

**Branch**: `017-agent-tool-expansion` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

## Summary

Make `AgentService` the single owner of LangChain agent execution, then add `create_review` and `download_file` dependency-injected tools. The API route will provide callbacks to existing review and storage services while intentionally preserving their vulnerable behavior for FAA/DAST demonstrations.

## Technical Context

- **Affected packages**: `@iwa/agent`, `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: none
- **Data model changes**: none
- **Unknowns**: none

## Constitution Check

- [x] Existing intentional vulnerabilities and markers are preserved.
- [x] New vulnerabilities include markers, catalog entries, regression tests, and `DEMO.md` payloads.
- [x] Workspace boundaries remain unchanged; no tsconfig path changes.
- [x] No new optional credentials or startup behavior are introduced.
- [x] No remediation is included.

## Project Structure

```text
specs/017-agent-tool-expansion/
├── spec.md
├── plan.md
└── tasks.md
```

## Implementation Order

1. Add tool contracts and extend `AgentDependencies`.
2. Consolidate the API route around `AgentService`.
3. Add focused tool tests and route compatibility coverage.
4. Update `DEMO.md` and `packages/web/src/publicPages.tsx`.
5. Build and run focused/API/SAST validation.

## Complexity Tracking

None.
