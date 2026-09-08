# Implementation Plan: Fortify Demo Workflows

**Branch**: `main` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/015-fortify-demo-workflows/spec.md`

## Summary

Add committed patch fixtures for local `/fortify-change-review` demos, plus a committed `/fortify-remediate` branch patch that creates unmarked route-visible targets under `packages/api/src/remediationDemo/` so Fortify SAST can create issue records and Aviator can attach fix guidance on a demo branch.

## Technical Context

- **Affected packages**: `@iwa/api`
- **Dependencies added/changed**: none
- **Data model changes**: none
- **Unknowns**: none

## Constitution Check

- [x] **I. Intentional Insecurity Is Sacrosanct** — no existing `INSECURE:` marker, vulnerability table entry, or pinned vulnerable dependency is fixed, removed, or weakened by this plan.
- [x] **II. Documented Vulnerability Lifecycle** — the change-review demos are patch fixtures, and remediation targets use the documented `packages/api/src/remediationDemo/` exception because Aviator rejects INTENTIONAL-marked findings.
- [x] **III. Monorepo Workspace Boundaries** — changes stay within existing workspace/package boundaries.
- [x] **IV. Fault-Tolerant Runtime Configuration** — no new optional credentials are introduced.
- [x] **V. Fixable Bugs vs. Preserved Vulnerabilities** — no existing documented vulnerability is fixed as a side effect.

## Project Structure

### Documentation

```text
specs/015-fortify-demo-workflows/
├── spec.md
├── plan.md
└── tasks.md
```

### Source code

```text
bin/
├── fortify-demo-vulns.mjs
├── fortify-demo-vulns.ps1
└── fortify-demo-vulns.sh

demo-patches/
├── fortify-change-review/
│   ├── cwe-89-username-lookup.patch
│   └── cwe-918-newsletter-template.patch
└── fortify-remediate/
	└── route-visible-sqli-ssrf.patch
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Patch-created unmarked vulnerable code under `packages/api/src/remediationDemo/` on a demo branch | Fortify Remediation Aviator refuses INTENTIONAL-marked findings, and `/fortify-remediate` needs committed, scanned issue IDs. | Keeping those files permanently on main adds unmarked vulnerable code to the default branch; stripping markers from permanent demo code risks accidental governance drift. |