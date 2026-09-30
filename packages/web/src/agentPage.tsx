import React from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { marked } from 'marked';

const openAiApiKeyStorageKey = 'iwa.openaiApiKey';

function getStoredOpenAiApiKey() {
  try {
    return window.localStorage.getItem(openAiApiKeyStorageKey) ?? '';
  } catch {
    return '';
  }
}

function setStoredOpenAiApiKey(apiKey: string) {
  window.localStorage.setItem(openAiApiKeyStorageKey, apiKey);
}

function clearStoredOpenAiApiKey() {
  window.localStorage.removeItem(openAiApiKeyStorageKey);
}

type ToolCallRecord = {
  tool: string;
  input: string;
  output: string;
  denied?: boolean;
};

type ChatTurn = {
  message: string;
  reply: string;
  toolCalls: ToolCallRecord[];
};

export function AssistantPage({ signedIn = false, bootstrapLoaded = false }: { signedIn?: boolean; bootstrapLoaded?: boolean }) {
  const [conversationId, setConversationId] = React.useState<string | undefined>(undefined);
  const [history, setHistory] = React.useState<ChatTurn[]>([]);
  const [keyConfigured, setKeyConfigured] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setKeyConfigured(Boolean(getStoredOpenAiApiKey()));
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setPending(true);
    setError(null);
    try {
      const apiKey = getStoredOpenAiApiKey();
      const response = await fetch('/api/v3/agent/chat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey.trim() ? { 'X-OpenAI-API-Key': apiKey.trim() } : {}),
        },
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
      <div className="assistant-heading">
        <div className="mb-2 flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-7 w-7 text-brand-muted" aria-hidden="true" />
          <h1 className="!mb-0">Ask Olive</h1>
        </div>
        <a className="assistant-setup-link" href="/app/assistant/setup">Setup</a>
      </div>
      <p>Ask me about medicines or treatments. I can look up the status of your orders or even help you review a purchase.</p>

      {bootstrapLoaded && !signedIn ? (
        <div className="notice compact">
          You are browsing as a guest. I can search products and answer general questions.{' '}
          <a href={`/app/login?redirect=${encodeURIComponent('/app/assistant')}`}>Sign in</a> for order lookups and
          shipping address changes.
        </div>
      ) : null}

      {!keyConfigured ? <div className="notice compact">OpenAI key not configured. <a href="/app/assistant/setup">Open setup</a>.</div> : null}

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
          placeholder="e.g. What's the status of order ORD-001"
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

export function AssistantSetupPage() {
  const [apiKey, setApiKey] = React.useState('');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    setApiKey(getStoredOpenAiApiKey());
  }, []);

  function saveApiKey(e: React.FormEvent) {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      clearStoredOpenAiApiKey();
      setMessage('OpenAI API key cleared for this browser.');
      return;
    }
    setStoredOpenAiApiKey(trimmedKey);
    setMessage('OpenAI API key saved for this browser.');
  }

  function clearApiKey() {
    clearStoredOpenAiApiKey();
    setApiKey('');
    setMessage('OpenAI API key cleared for this browser.');
  }

  return (
    <section className="assistant-page">
      <div className="mb-2 flex items-center gap-2">
        <ChatBubbleLeftRightIcon className="h-7 w-7 text-brand-muted" aria-hidden="true" />
        <h1 className="!mb-0">Assistant Setup</h1>
      </div>
      <p>Save an OpenAI API key for this browser before using the assistant.</p>

      {message ? <div className="notice compact">{message}</div> : null}

      <form className="assistant-settings" onSubmit={saveApiKey}>
        <label>
          OpenAI API Key
          <input
            autoComplete="off"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
        </label>
        <div className="assistant-setup-actions">
          <button type="submit">Save Key</button>
          <button className="danger-button" type="button" onClick={clearApiKey}>Clear Key</button>
          <a className="button secondary outline" href="/app/assistant">Back To Assistant</a>
        </div>
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
        <p key={i} className={call.denied ? 'assistant-turn-tool assistant-turn-tool-denied' : 'assistant-turn-tool'}>
          <em>
            {call.denied ? 'Blocked (sign-in required): ' : 'Called '}
            {call.tool}({call.input})
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
  return <div className="assistant-turn-reply" dangerouslySetInnerHTML={{ __html: toSiteRelativeLinks(String(marked.parse(reply))) }} />;
}

// The model likes to invent a hostname for the site-relative paths the tools return; pin them back to this origin.
function toSiteRelativeLinks(html: string): string {
  return html.replace(/href="https?:\/\/[^"/]+(\/(?:app|user|api)\/[^"]*)"/gi, 'href="$1"');
}
