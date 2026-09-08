# Implementation Plan: Conversational AI Assistant

**Branch**: `002-agent-assistant` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-agent-assistant/spec.md`

## Summary

Add a new `@iwa/agent` workspace that wraps the LangChain/OpenAI model and exposes tool-calling behavior through an authenticated API route. Keep construction lazy in the API layer so optional AI credentials affect only the assistant feature, then add a React page that renders responses for the demo.

## Technical Context

- **Affected packages**: `@iwa/shared`, `@iwa/agent`, `@iwa/api`, `@iwa/web`
- **Dependencies added/changed**: LangChain/OpenAI dependencies in `@iwa/agent`
- **Data model changes**: none
- **Unknowns**: none

## Constitution Check

*GATE: must pass before implementation starts; re-check if the plan changes materially.*

- [x] **I. Intentional Insecurity Is Sacrosanct** — no existing `INSECURE:` marker, vulnerability table entry, or pinned vulnerable dependency is fixed, removed, or weakened by this plan.
- [x] **II. Documented Vulnerability Lifecycle** — the marker comment, `publicPages.tsx` entry, regression tests, and `DEMO.md` entries are all scheduled as tasks.
- [x] **III. Monorepo Workspace Boundaries** — build order remains `shared → agent → web → api`; package-local tsconfig path options remain in leaf configs.
- [x] **IV. Fault-Tolerant Runtime Configuration** — `OPENAI_API_KEY` is read by lazily constructed assistant code and fails only assistant requests.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — no unrelated hardening or vulnerability retirement is included.

## Project Structure

### Documentation (this feature)

```text
specs/002-agent-assistant/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code (repository root)

```text
packages/
├── shared/src/agent.ts
├── agent/src/AgentService.ts
├── agent/src/systemPrompt.ts
├── agent/src/tools/fetchUrlTool.ts
├── agent/src/tools/queryOrdersTool.ts
├── api/src/api/v3/agent.ts
├── api/tests/vulnerabilities/agentPromptInjection.test.ts
├── api/tests/vulnerabilities/agentExcessiveAgency.test.ts
├── api/tests/vulnerabilities/agentSSRF.test.ts
├── api/tests/vulnerabilities/agentInsecureOutput.test.ts
└── web/src/agentPage.tsx
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| none | n/a | n/a |