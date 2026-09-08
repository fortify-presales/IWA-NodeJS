import React from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { marked } from 'marked';

type ToolCallRecord = {
  tool: string;
  input: string;
  output: string;
};

type ChatTurn = {
  message: string;
  reply: string;
  toolCalls: ToolCallRecord[];
};

export function AssistantPage() {
  const [conversationId, setConversationId] = React.useState<string | undefined>(undefined);
  const [history, setHistory] = React.useState<ChatTurn[]>([]);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch('/api/v3/agent/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationId }),
      });
      const payload = await response.json();
      if (!response.ok || payload.status === 'error') {
        throw new Error(payload.message || `Request failed: ${response.status}`);
      }
      setConversationId(payload.data.conversationId);
      setHistory((prev) => [...prev, { message, reply: payload.data.reply, toolCalls: payload.data.toolCalls }]);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="assistant-page">
      <div className="mb-2 flex items-center gap-2">
        <ChatBubbleLeftRightIcon className="h-7 w-7 text-brand-muted" aria-hidden="true" />
        <h1 className="!mb-0">AI Assistant</h1>
      </div>
      <p>Ask about orders or products. The assistant can look up an order by ID or fetch a web page for you.</p>

      {error ? (
        <div className="danger-notice compact" role="alert">
          {error}
        </div>
      ) : null}

      <div className="assistant-history">
        {history.map((turn, i) => (
          <AssistantTurn key={i} turn={turn} />
        ))}
      </div>

      <form className="assistant-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. What's the status of order 1234?"
          disabled={pending}
        />
        <button type="submit" disabled={pending}>
          <PaperAirplaneIcon className="h-5 w-5" aria-hidden="true" />
          {pending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </section>
  );
}

function AssistantTurn({ turn }: { turn: ChatTurn }) {
  return (
    <div className="assistant-turn">
      <p className="assistant-turn-user">
        <strong>You:</strong> {turn.message}
      </p>
      {turn.toolCalls.map((call, i) => (
        <p key={i} className="assistant-turn-tool">
          <em>
            Called {call.tool}({call.input})
          </em>
        </p>
      ))}
      <AssistantReply reply={turn.reply} />
    </div>
  );
}

function AssistantReply({ reply }: { reply: string }) {
  // INSECURE: agent reply rendered into the DOM without sanitization (CWE-79)
  // Purpose: demonstrates insecure output handling for an LLM agent - a prompt-injected reply can execute script
  // Fix: render the reply as plain text (let React escape it) or sanitize with an allow-list HTML sanitizer
  return <div className="assistant-turn-reply" dangerouslySetInnerHTML={{ __html: String(marked.parse(reply)) }} />;
}
