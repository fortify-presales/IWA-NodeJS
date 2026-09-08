<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
Bump rationale: Initial ratification, derived from .github/copilot-instructions.md and verified
  repo conventions (npm workspaces monorepo, dotenv fallback, lazy AI agent construction).
Principles defined:
  I.   Intentional Insecurity Is Sacrosanct (NON-NEGOTIABLE)
  II.  Documented Vulnerability Lifecycle
  III. Monorepo Workspace Boundaries
  IV.  Fault-Tolerant Runtime Configuration
  V.   Fixable Bugs vs. Preserved Vulnerabilities
Templates reviewed for alignment:
  ✅ specs/templates/spec-template.md
  ✅ specs/templates/plan-template.md
  ✅ specs/templates/tasks-template.md
Follow-up TODOs: none.
-->

# IWA-NodeJS Constitution

## Core Principles

### I. Intentional Insecurity Is Sacrosanct (NON-NEGOTIABLE)

This application is deliberately vulnerable for security-tooling training and demonstration.
Code marked as intentionally insecure MUST NOT be fixed, sanitized, or hardened. Vulnerability
marker comments MUST NOT be removed. Dependencies deliberately pinned to vulnerable versions in
`DEPENDENCIES.md` MUST NOT be upgraded. Any change that would remove or weaken a documented
vulnerability requires an explicit, separate decision to retire that vulnerability — never a
side effect of an unrelated change.

### II. Documented Vulnerability Lifecycle

Every intentional vulnerability MUST carry this comment block immediately above the vulnerable
code:

```typescript
// INSECURE: <one-line description of the vulnerability> (CWE-XX)
// Purpose: <what security tool or security lesson this demonstrates>
// Fix: <how a real production app would remediate this>
```

Adding a new intentional vulnerability MUST also: add it to the `vulnerabilities` table in
`packages/web/src/publicPages.tsx`; add a regression test in `packages/api/tests/vulnerabilities/`;
and document exact payloads/expected results in `DEMO.md`.

Exception: Fortify Remediation Aviator branch-demo targets created from
`demo-patches/fortify-remediate/` under `packages/api/src/remediationDemo/` are intentionally
unmarked so Aviator can provide fix guidance for scanned findings. These patch-created
files MAY be exposed only under the dedicated `/api/v3/remediation-demo` route prefix for SAST
dataflow traceability, MUST NOT be linked from public UI, MUST be documented in `DEMO.md`, and
MUST only be committed/remediated when explicitly demonstrating `/fortify-remediate` on committed,
scan-visible findings.

### III. Monorepo Workspace Boundaries

The repo is native npm workspaces (`packages/{shared,agent,api,web}`), not Turborepo/Nx. Build
order is `shared → agent → web → api` because `@iwa/api` and `@iwa/agent` import compiled
`dist/` output, not source. tsconfig path options (`rootDir`/`outDir`/`include`) MUST live in each
package's own `tsconfig.json`, never in the shared `tsconfig.base.json` (base-file path options
resolve relative to the base file's directory, not the extending package). Runtime paths
(`./data/...`, `path.resolve('public')`, `./logs/...`) resolve relative to `process.cwd()`, so
scripts MUST run with cwd set to the owning package.

### IV. Fault-Tolerant Runtime Configuration

Code that depends on optional third-party credentials (e.g. `OPENAI_API_KEY`) MUST NOT crash the
whole process at import time when that credential is absent — construct such services lazily and
fail only the specific request/feature that needs them, with a clear error message. Environment
loading MUST support both the per-package `.env` (cwd-relative, e.g. inside a container) and the
monorepo root `.env` as a fallback, without overriding whichever is already set.

### V. Fixable Bugs vs. Preserved Vulnerabilities

It is always OK to fix: bugs that prevent the app from starting or crash it unexpectedly (unless
the crash is itself the intentional vulnerability), TypeScript compilation errors, build/CI
configuration issues, and test-infrastructure problems. It is never OK to "fix" a documented
vulnerability as a side effect of pursuing one of these — call it out and leave it in place.

## Governance

This constitution supersedes ad-hoc conventions for anything it covers. Amendments are made via a
normal PR that edits this file directly, incrementing the version per semantic versioning
(MAJOR: incompatible principle removal/redefinition; MINOR: new/expanded principle; PATCH:
wording/clarification only) and prepending an updated Sync Impact Report comment at the top of
this file. `.github/copilot-instructions.md` is the condensed, always-loaded summary of this
document for AI coding agents; keep the two in sync when either changes.

**Version**: 1.0.0 | **Ratified**: 2026-09-07 | **Last Amended**: 2026-09-07
