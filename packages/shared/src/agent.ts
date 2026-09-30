export interface AgentChatRequest {
  message: string;
  conversationId?: string;
}

export interface AgentToolCallRecord {
  tool: string;
  input: string;
  output: string;
  /** True when the tool was refused because the caller is not signed in. */
  denied?: boolean;
}

export interface AgentChatResponse {
  conversationId: string;
  reply: string;
  toolCalls: AgentToolCallRecord[];
  authenticated: boolean;
}
