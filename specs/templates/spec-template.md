# Feature Specification: [FEATURE NAME]

**Status**: Draft | **Branch**: `[###-feature-slug]` | **Date**: [DATE]
**Input**: [one-line description of the request this spec came from]

## Overview

[2-3 sentences: what is this feature, who is it for, why does it matter]

## Is this an intentional vulnerability demonstration?

- [ ] No — this is a normal feature/fix.
- [ ] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle). If yes, fill in:
  - **CWE**: [CWE-XX]
  - **Purpose**: [what security tool/lesson this demonstrates]
  - **Fix**: [how a real production app would remediate this]
  - Confirms: `publicPages.tsx` table entry, regression test under `packages/api/tests/vulnerabilities/`,
    and a `DEMO.md` entry with exact payloads are all planned in this spec's tasks.

## User Scenarios

### Primary scenario

Given [context], when [action], then [outcome].

### Additional scenarios

- Given ..., when ..., then ...

### Edge cases

- What happens when [boundary condition]?

## Functional Requirements

- **FR-001**: The system MUST [specific, testable capability].
- **FR-002**: The system MUST [specific, testable capability].
- **FR-003**: Users MUST be able to [key interaction].

*(Mark unclear requirements with `[NEEDS CLARIFICATION: specific question]` — limit to 3 max.)*

## Out of Scope

- [explicitly excluded from this feature]

## Success Criteria

- **SC-001**: [Measurable outcome, no implementation detail, e.g. "a logged-in user can complete X in under Y seconds"]
- **SC-002**: [Measurable outcome]

## Affected Packages

- [ ] `packages/shared` — [why]
- [ ] `packages/agent` — [why]
- [ ] `packages/api` — [why]
- [ ] `packages/web` — [why]
