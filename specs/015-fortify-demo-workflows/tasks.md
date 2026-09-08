# Tasks: Fortify Demo Workflows

**Input**: Design documents from `specs/015-fortify-demo-workflows/` (`spec.md`, `plan.md`)
**Tests**: Validate patch application in both the baseline and patch-applied demo branch states.

## Format

`- [ ] [TaskID] [P?] Description with exact file path`

## Phase 1: Governance

- [x] T001 Update `specs/memory/constitution.md` with the `packages/api/src/remediationDemo/` marker exception
- [x] T002 Update `.github/copilot-instructions.md` with the same remediation-demo exception

## Phase 2: Remediation Demo Branch Patch

- [x] T003 Add route-visible SQL injection and SSRF remediation branch patch in `demo-patches/fortify-remediate/route-visible-sqli-ssrf.patch`
- [x] T004 Add remediation patch commands in `bin/fortify-demo-vulns.mjs` and `package.json`

## Phase 3: Change Review Patch Tooling

- [x] T005 Add SQL injection patch fixture in `demo-patches/fortify-change-review/cwe-89-username-lookup.patch`
- [x] T006 Add SSRF patch fixture in `demo-patches/fortify-change-review/cwe-918-newsletter-template.patch`
- [x] T007 Add shared patch tool in `bin/fortify-demo-vulns.mjs`
- [x] T008 Add PowerShell wrapper in `bin/fortify-demo-vulns.ps1`
- [x] T009 Add Bash wrapper in `bin/fortify-demo-vulns.sh`
- [x] T010 Add npm convenience scripts in `package.json`

## Phase 4: Workflow and Documentation

- [x] T011 Enable `.github/workflows/fod-scan.yml` Aviator remediations only for manual runs on `demo/fortify-remediate`
- [x] T012 Document exact demo workflows in `DEMO.md`
- [x] T013 Add this spec set under `specs/015-fortify-demo-workflows/`

## Phase 5: Validation

- [x] T014 Run patch tool status/list checks
- [x] T015 Apply and revert each patch fixture
- [x] T016 Run `npm run build -w packages/api`
- [x] T017 Run `npm run test:vulns -w packages/api`

## Dependencies

- Phase 1 blocks Phase 2
- Phase 2 and Phase 3 can run independently after Phase 1
- Phase 4 runs after implementation details are known
- Phase 5 runs last