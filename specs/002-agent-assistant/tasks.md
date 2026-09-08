# Tasks: Conversational AI Assistant

**Input**: Design documents from `specs/002-agent-assistant/` (`spec.md`, `plan.md`)
**Tests**: Vulnerability regression coverage is required by Constitution Principle II.

## Phase 1: Setup

- [x] T001 Add `@iwa/agent` workspace package and TypeScript configuration in `packages/agent/package.json` and `packages/agent/tsconfig.json`
- [x] T002 Add assistant route registration in `packages/api/src/api/v3/agent.ts`

## Phase 2: Foundational (blocking prerequisites)

- [x] T003 Define shared chat contracts in `packages/shared/src/agent.ts`
- [x] T004 Add assistant system prompt in `packages/agent/src/systemPrompt.ts`
- [x] T005 Add tool implementations in `packages/agent/src/tools/queryOrdersTool.ts` and `packages/agent/src/tools/fetchUrlTool.ts`

## Phase 3: Core Implementation

- [x] T006 Add LangChain/OpenAI orchestration in `packages/agent/src/AgentService.ts`
- [x] T007 Wire lazy assistant construction and request handling in `packages/api/src/api/v3/agent.ts`
- [x] T008 Add React assistant page in `packages/web/src/agentPage.tsx`
- [x] T009 Add assistant navigation/routing in `packages/web/src/main.tsx`

## Phase 4: Vulnerability Documentation

- [x] T010 Add `INSECURE:`/`Purpose:`/`Fix:` marker comments above the vulnerable AI behavior
- [x] T011 Add vulnerability table entries in `packages/web/src/publicPages.tsx`
- [x] T012 Add regression tests in `packages/api/tests/vulnerabilities/agentPromptInjection.test.ts`, `agentExcessiveAgency.test.ts`, `agentSSRF.test.ts`, and `agentInsecureOutput.test.ts`
- [x] T013 Document exact AI payloads and expected results in `DEMO.md`

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T014 Document `OPENAI_API_KEY` behavior where assistant setup is described
- [x] T015 Run build/test checks for `@iwa/shared`, `@iwa/agent`, `@iwa/web`, and `@iwa/api`

## Dependencies

- Phase 2 blocks Phase 3
- Phase 3 blocks Phase 4
- Phase 5 runs last