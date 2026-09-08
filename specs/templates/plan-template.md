# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-slug]` | **Date**: [DATE] | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/[###-feature-slug]/spec.md`

## Summary

[1 paragraph: what will be built and the high-level technical approach]

## Technical Context

- **Affected packages**: [`@iwa/shared` / `@iwa/agent` / `@iwa/api` / `@iwa/web`]
- **Dependencies added/changed**: [none / list]
- **Data model changes**: [none / describe]
- **Unknowns**: [NEEDS CLARIFICATION: ...] (resolve before implementation)

## Constitution Check

*GATE: must pass before implementation starts; re-check if the plan changes materially.*

- [ ] **I. Intentional Insecurity Is Sacrosanct** — no existing `INSECURE:` marker, vulnerability
      table entry, or pinned vulnerable dependency is fixed, removed, or weakened by this plan.
- [ ] **II. Documented Vulnerability Lifecycle** — if this feature intentionally introduces a
      vulnerability, the marker comment, `publicPages.tsx` entry, regression test, and `DEMO.md`
      entry are all scheduled as tasks.
- [ ] **III. Monorepo Workspace Boundaries** — new/changed packages build in dependency order
      (`shared → agent → web → api`); no path options added to `tsconfig.base.json`.
- [ ] **IV. Fault-Tolerant Runtime Configuration** — any new optional external credential is read
      lazily and fails only the dependent feature, not process startup.
- [ ] **V. Fixable Bugs vs. Preserved Vulnerabilities** — any bugfixes included are limited to
      startup/crash, compilation, build, or test-infra issues.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature-slug]/
├── spec.md      # Feature specification (input to this plan)
├── plan.md      # This file
└── tasks.md     # Task breakdown (written by a follow-up /tasks-style pass)
```

### Source code (repository root)

```text
packages/
├── shared/src/...   # [only if touched]
├── agent/src/...    # [only if touched]
├── api/src/...      # [only if touched]
└── web/src/...      # [only if touched]
```

## Complexity Tracking

> Fill only if the Constitution Check has an unavoidable violation that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| [e.g., new top-level package] | [current need] | [why an existing package wasn't enough] |
