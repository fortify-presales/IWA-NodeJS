# Feature Specification: MCP Agent Security Feasibility

**Status**: Draft | **Branch**: `016-mcp-agent-tools` | **Date**: 2026-09-16  
**Input**: [GitHub issue #20](https://github.com/fortify-presales/IWA-NodeJS/issues/20) — evaluate exposing existing agent capabilities through MCP for additional Fortify SAST and FAA demonstrations.

## Overview

This specification evaluates a future remote Model Context Protocol (MCP) surface for the existing
pharmacy agent capabilities. It gives maintainers and security demonstrators a bounded architecture,
risk taxonomy, and evidence standard for deciding whether an MCP implementation would add useful
Fortify SAST or Fortify Agentic Analyzer (FAA) coverage.

This feature delivers documentation only. It does not add an MCP server, endpoint, dependency,
test, vulnerability, scan artifact, user interface, or runtime behavior.

## Is this an intentional vulnerability demonstration?

- [x] No — this is a documentation-only feature and introduces no executable vulnerability.
- [ ] Yes — see Constitution Principle II (Documented Vulnerability Lifecycle).

Any later implementation that intentionally introduces a vulnerability must independently satisfy
Constitution Principle II before it is merged.

## User Scenarios

### Primary scenario

Given the current in-process LangChain agent and its four pharmacy tools, when a maintainer evaluates
an MCP integration, then the maintainer can identify the smallest practical architecture and distinguish
new MCP trust-boundary risks from existing vulnerabilities exposed through another transport.

### Additional scenarios

- Given the current Fortify FPR and FAA SARIF artifacts, when a security demonstrator plans a future
  MCP experiment, then the demonstrator can define which findings require fresh SAST or FAA evidence.
- Given a future implementation proposal, when reviewers inspect its backlog, then they can see every
  required source, test, vulnerability-lifecycle, runtime, and scan task without treating those tasks as
  part of this documentation change.
- Given an external MCP host capable of selecting tools, when reviewers model the future trust boundary,
  then they can reason separately about server-side authorization and host-side user approval.

### Edge cases

- An MCP route that only wraps `AgentService.chat()` may add protocol reachability without adding a
  materially new vulnerability or analyzer trace.
- A local stdio server does not create the same remote authentication, Origin-validation, or DNS-rebinding
  concerns as Streamable HTTP.
- A SAST finding on an ordinary sink reachable from MCP input does not prove that the analyzer models MCP.
- An FAA finding that repeats an existing agent issue without identifying the MCP boundary is not new MCP
  coverage.
- An external MCP host may not be present in the scanned repository, limiting end-to-end analyzer context.

## Functional Requirements

- **FR-001**: The documentation MUST assess whether exposing the existing agent capabilities through MCP
  is technically feasible and operationally practical in this monorepo.
- **FR-002**: The documentation MUST identify remote Streamable HTTP mounted in `@iwa/api` as the recommended
  future architecture and explain why it is preferred over stdio and a separate workspace.
- **FR-003**: The documentation MUST define the proposed future MCP tools as `lookup_order`,
  `change_shipping_address`, `fetch_url`, and `search_products`.
- **FR-004**: The documentation MUST separate potentially distinct MCP risks from existing vulnerabilities
  that MCP would merely make reachable through another interface.
- **FR-005**: The documentation MUST classify all SAST and FAA coverage statements as hypotheses unless
  supported by an existing or future analyzer artifact.
- **FR-006**: The documentation MUST require a baseline-versus-new scan comparison before adding `SAST` or
  `FAA` labels to the public vulnerability catalog.
- **FR-007**: The task backlog MUST leave all executable MCP implementation work unchecked and require a
  separate approved implementation issue or pull request.
- **FR-008**: The GitHub feature issue MUST reference `specs/016-mcp-agent-tools/`, and this specification
  MUST reference the assigned issue number after issue creation.

## Candidate Security Demonstrations

| Candidate                                                                      | Classification                             | Expected coverage                             | Evidence requirement                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------- |
| Unauthenticated remote MCP tool authority (CWE-306/CWE-862)                    | Potentially distinct MCP trust boundary    | FAA likely; SAST uncertain                    | A new finding must identify the MCP endpoint or tool handler              |
| Missing Streamable HTTP Origin validation and DNS rebinding exposure (CWE-346) | MCP transport-specific                     | DAST/design review likely; SAST/FAA uncertain | Do not claim analyzer coverage without a corresponding artifact           |
| External-agent use of untrusted MCP tool results (CWE-1427)                    | Potentially distinct cross-system chain    | FAA plausible                                 | FAA must identify the MCP result-to-agent trust boundary                  |
| Order lookup without ownership checks (CWE-639)                                | Existing vulnerability through MCP         | Existing FAA/DAST category                    | Treat as added reachability unless a distinct MCP root cause is reported  |
| Address update without approval or ownership checks (CWE-862)                  | Existing vulnerability through MCP         | Existing FAA category                         | Treat as added reachability unless the MCP authority boundary is reported |
| Arbitrary URL fetch (CWE-918)                                                  | Existing vulnerability through MCP         | Existing FAA/DAST category                    | Treat as added reachability, not a new vulnerability                      |
| Attacker-controlled product descriptions returned as tool content (CWE-1427)   | Existing untrusted-data source through MCP | FAA plausible                                 | Distinguish a new external-agent chain from the existing in-process chain |

## Out of Scope

- Implementing an MCP server, client, route, transport, tool, or user interface.
- Adding or changing npm dependencies, environment variables, Docker configuration, or build scripts.
- Modifying `AgentService`, existing agent tools, API routes, repositories, or authentication behavior.
- Adding vulnerability markers, regression tests, catalog entries, or `DEMO.md` scenarios.
- Running SAST, FAA, DAST, or SCA scans as part of this documentation feature.
- Adding generic SQL injection, command injection, path traversal, or similar sinks solely to force a
  traditional SAST result.
- Claiming that Fortify explicitly models MCP SDK APIs without scan evidence.

## Success Criteria

- **SC-001**: The spec set contains `spec.md`, `plan.md`, and `tasks.md` with no unresolved template fields.
- **SC-002**: A reviewer can identify the recommended future architecture, four proposed tools, relevant
  trust boundaries, and rejected alternatives from the documentation alone.
- **SC-003**: Every candidate finding is labeled as potentially distinct, existing reachability, or
  unsupported until scan evidence exists.
- **SC-004**: No executable source, dependency manifest, test, scan artifact, vulnerability catalog, or
  runtime documentation is changed by this feature.
- **SC-005**: A GitHub feature issue with the `enhancement` label links this spec folder, and this file links
  back to that issue.

## Affected Packages

No package is changed by this documentation feature. A future implementation is expected to affect:

- [ ] `packages/shared` — no shared protocol types are currently proposed.
- [x] `packages/agent` — future tool semantics and model trust boundaries are in scope for analysis.
- [x] `packages/api` — recommended future home of the Streamable HTTP endpoint and tool handlers.
- [x] `packages/web` — future vulnerability-catalog updates may be required after scan evidence exists.
