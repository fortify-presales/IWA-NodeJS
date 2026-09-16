# Tasks: MCP Agent Security Feasibility

**Input**: Design documents from `specs/016-mcp-agent-tools/` (`spec.md`, `plan.md`)  
**Scope**: This feature delivers specification artifacts and a linked GitHub issue only. Every executable
MCP task below requires a separate approved implementation issue or pull request.

## Format

`- [ ] [TaskID] [P?] Description with exact file path`

## Phase 1: Specification and Traceability

- [x] T001 Create the feature specification in `specs/016-mcp-agent-tools/spec.md`
- [x] T002 Create the feasibility and technical plan in `specs/016-mcp-agent-tools/plan.md`
- [x] T003 Create the deferred implementation backlog in `specs/016-mcp-agent-tools/tasks.md`
- [x] T004 Create [GitHub issue #20](https://github.com/fortify-presales/IWA-NodeJS/issues/20) referencing `specs/016-mcp-agent-tools/`
- [x] T005 Add the assigned GitHub issue reference to `specs/016-mcp-agent-tools/spec.md`

## Phase 2: Deferred MCP Foundation

- [ ] T006 Confirm the current stable MCP TypeScript SDK and Node/Express transport APIs against official documentation
- [ ] T007 Add approved MCP server, transport, and schema dependencies to `packages/api/package.json` and refresh `package-lock.json`
- [ ] T008 Add a stateless Streamable HTTP MCP endpoint in `packages/api/src/api/v3/mcp.ts`
- [ ] T009 Mount `/api/v3/mcp` in `packages/api/src/app.ts`

## Phase 3: Deferred MCP Tools

- [ ] T010 Register `lookup_order` with direct `orderRepository` access in `packages/api/src/api/v3/mcp.ts`
- [ ] T011 Register `change_shipping_address` with direct `orderRepository` access in `packages/api/src/api/v3/mcp.ts`
- [ ] T012 Register `fetch_url` with a scanner-visible outbound request in `packages/api/src/api/v3/mcp.ts`
- [ ] T013 Register `search_products` with direct `productRepository` access in `packages/api/src/api/v3/mcp.ts`
- [ ] T014 Preserve the current model invocation and intentional vulnerabilities in `packages/agent/src/AgentService.ts` and `packages/api/src/api/v3/agent.ts`

## Phase 4: Deferred Vulnerability Lifecycle

- [ ] T015 Add `INSECURE:`/`Purpose:`/`Fix:` marker blocks above every distinct intentional MCP vulnerability
- [ ] T016 Add deterministic MCP regression tests under `packages/api/tests/vulnerabilities/`
- [ ] T017 Add or amend rows in `packages/web/src/publicPages.tsx` without counting existing root causes as new vulnerabilities
- [ ] T018 Document exact MCP payloads and expected results in `DEMO.md`
- [ ] T019 Apply `SAST` or `FAA` tooling labels only where fresh analyzer artifacts provide supporting evidence

## Phase 5: Deferred Protocol and Runtime Validation

- [ ] T020 Add initialization, `tools/list`, malformed-request, and tool-call tests under `packages/api/tests/mcp/`
- [ ] T021 Validate unauthenticated invocation, hostile Origin handling, order access, order mutation, arbitrary URL fetch, and untrusted product output
- [ ] T022 Run focused MCP tests and `npm run test:vulns -w packages/api`
- [ ] T023 Run `npm run build`, `npm run lint`, and a live Streamable HTTP MCP smoke test
- [ ] T024 Build the Docker image and repeat the MCP protocol smoke test against the container

## Phase 6: Deferred Fortify Evidence

- [ ] T025 Record findings from `iwa-nodejs-20260915173034.fpr` and `iwa-nodejs.faa.sarif` as the comparison baseline
- [ ] T026 Run `bin/sast-scan.ps1` and retain the new timestamped FPR
- [ ] T027 Run `bin/faa-scan.ps1` and retain the new FAA SARIF
- [ ] T028 Compare findings by analyzer, category, source, sink, path, and dataflow against the baseline
- [ ] T029 Document unsupported or negative MCP analyzer results without adding unrelated vulnerable sinks
- [ ] T030 Finalize conditional catalog and `DEMO.md` tooling labels from the evidence decision record

## Dependencies

- T004 blocks T005 and completes the current documentation-only deliverable.
- No task after T005 is authorized by the current feature.
- Phase 2 blocks Phase 3.
- Phase 3 blocks Phases 4 and 5.
- Phase 5 blocks Phase 6.
- T028 blocks T019 and T030.
