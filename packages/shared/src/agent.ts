export interface AgentChatRequest {
  message: string;
  conversationId?: string;
}

export interface AgentToolCallRecord {
  tool: string;
  input: string;
  output: string;
}

export interface AgentChatResponse {
  conversationId: string;
  reply: string;
  toolCalls: AgentToolCallRecord[];
}
