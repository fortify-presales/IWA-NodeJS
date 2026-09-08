# Feature Specification: Fortify Demo Workflows

**Status**: Draft | **Branch**: `main` | **Date**: 2026-09-08
**Input**: Add demo vulnerabilities for `/fortify-change-review` and `/fortify-remediate`, including an Aviator-compatible remediation workaround.

## Overview

This feature adds repeatable Fortify skill demonstrations for local change review and Fortify-backed remediation. Change-review demos are temporary patch fixtures, while remediation demos are committed, scan-visible targets that Fortify Remediation Aviator can fix.

## Is this an intentional vulnerability demonstration?

- [ ] No — this is a normal feature/fix.
- [x] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle). If yes, fill in:
  - **CWE**: CWE-89 and CWE-918
  - **Purpose**: Demonstrate `/fortify-change-review` on local diffs, `/fortify-remediate` using Aviator fix guidance from committed Fortify findings, and CI Aviator remediation PR creation on the dedicated demo branch.
  - **Fix**: Use parameterized database access and restrict outbound server-side requests to approved destinations.
  - Confirms: change-review vulnerabilities live in patch fixtures; remediation targets use the documented `packages/api/src/remediationDemo/` exception when the remediation patch is applied on a demo branch, and `DEMO.md` documents the branch workflow.

## User Scenarios

### Primary scenario

Given a clean working tree, when a demo operator applies a change-review patch, then `/fortify-change-review` can review the resulting diff and the patch can be reverted before commit.

### Additional scenarios

- Given committed remediation demo targets have been scanned, when a demo operator filters Fortify findings by `packages/api/src/remediationDemo`, then `/fortify-remediate` can target those issue IDs and use Aviator fix guidance.
- Given normal runtime app usage, when users navigate the app, then remediation demo targets are reachable only through the dedicated `/api/v3/remediation-demo` API prefix and are not linked from public UI.

### Edge cases

- Patch application must fail clearly if the target file has local changes or if the patch is already applied.
- Remediation demo targets must remain unmarked with `INSECURE:` so Aviator does not reject them as INTENTIONAL findings.

## Functional Requirements

- **FR-001**: The repository MUST provide committed patch fixtures for two `/fortify-change-review` demos: SQL injection and SSRF.
- **FR-002**: The repository MUST provide PowerShell, Bash, and npm commands to list, apply, revert, and check patch-demo status.
- **FR-003**: The repository MUST include a committed remediation patch fixture that creates TypeScript targets under `packages/api/src/remediationDemo/` for Fortify SAST/Aviator scans on a demo branch.
- **FR-004**: Remediation targets MUST be scan-visible through the dedicated `/api/v3/remediation-demo` API prefix but not linked from public UI entries.
- **FR-005**: Governance docs MUST describe the narrow exception allowing unmarked remediation targets.
- **FR-006**: `DEMO.md` MUST document exact operator commands and Fortify issue-selection guidance.

## Out of Scope

- Adding new public exploit endpoints for the remediation targets.
- Changing or removing existing permanent `INSECURE:` vulnerability markers.
- Updating intentionally pinned vulnerable dependencies.

## Success Criteria

- **SC-001**: A demo operator can apply and revert each change-review patch from PowerShell or Bash.
- **SC-002**: `npm run build -w packages/api` succeeds with the committed remediation targets.
- **SC-003**: Patch validation confirms remediation targets are unmarked and registered only through the dedicated demo API prefix after the remediation patch is applied.
- **SC-004**: A Fortify scan can produce findings whose paths include `packages/api/src/remediationDemo` for `/fortify-remediate` targeting.

## Affected Packages

- [ ] `packages/shared` — not affected
- [ ] `packages/agent` — not affected
- [x] `packages/api` — remediation demo targets created by patch on a demo branch
- [ ] `packages/web` — not affected