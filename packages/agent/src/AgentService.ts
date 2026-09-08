import { randomUUID } from 'node:crypto';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from '@langchain/core/messages';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { convertToOpenAITool } from '@langchain/core/utils/function_calling';
import type { AgentChatResponse, AgentToolCallRecord } from '@iwa/shared';
import { buildSystemPrompt } from './systemPrompt.js';
import { createOrderLookupTool, type OrderLookup } from './tools/queryOrdersTool.js';
import { createShippingAddressTool, type ShippingAddressUpdater } from './tools/updateShippingAddressTool.js';
import { createUrlFetchTool, type UrlFetcher } from './tools/fetchUrlTool.js';
import { createProductSearchTool, type ProductSearcher } from './tools/searchProductsTool.js';

export interface AgentDependencies {
  lookupOrder: OrderLookup;
  updateShippingAddress: ShippingAddressUpdater;
  fetchUrl: UrlFetcher;
  searchProducts: ProductSearcher;
  apiKey?: string;
  model?: string;
}

const MAX_TOOL_ITERATIONS = 5;

export class AgentService {
  // Bound directly to `ChatOpenAI` (not `.bindTools()`, which wraps it in a RunnableBinding) so
  // static analysis can still trace `.invoke()` calls back to this remote model instance.
  private readonly model: ChatOpenAI;
  private readonly tools: StructuredToolInterface[];
  private readonly openAiTools: ReturnType<typeof convertToOpenAITool>[];

  constructor(deps: AgentDependencies) {
    this.tools = [
      createOrderLookupTool(deps.lookupOrder),
      createShippingAddressTool(deps.updateShippingAddress),
      createUrlFetchTool(deps.fetchUrl),
      createProductSearchTool(deps.searchProducts),
    ];
    this.openAiTools = this.tools.map((t) => convertToOpenAITool(t));
    this.model = new ChatOpenAI({
      apiKey: deps.apiKey ?? process.env.OPENAI_API_KEY,
      model: deps.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0,
    });
  }

  async chat(userMessage: string, conversationId: string = randomUUID()): Promise<AgentChatResponse> {
    const toolCalls: AgentToolCallRecord[] = [];
    const messages: BaseMessage[] = [
      new SystemMessage(buildSystemPrompt(userMessage)),
      new HumanMessage(userMessage),
    ];

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await this.model.invoke(messages, { tools: this.openAiTools });
      messages.push(response as AIMessage);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        return { conversationId, reply: String(response.content), toolCalls };
      }

      for (const call of response.tool_calls) {
        const matchedTool = this.tools.find((t) => t.name === call.name);
        const output = matchedTool ? await matchedTool.invoke(call.args as never) : `Unknown tool: ${call.name}`;
        toolCalls.push({ tool: call.name, input: JSON.stringify(call.args), output: String(output) });
        messages.push(new ToolMessage({ content: String(output), tool_call_id: call.id ?? call.name }));
      }
    }

    return { conversationId, reply: 'Agent stopped after too many tool call iterations.', toolCalls };
  }
}
