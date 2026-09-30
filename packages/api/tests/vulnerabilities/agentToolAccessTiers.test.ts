import { describe, expect, it } from 'vitest';
import { AgentService, AUTH_REQUIRED_TOOLS, PUBLIC_TOOLS, SIGN_IN_MESSAGE } from '@iwa/agent';

function buildAgent(authenticated: boolean, spies: Record<string, () => void> = {}) {
  return new AgentService({
    authenticated,
    apiKey: 'sk-test',
    lookupOrder: async (orderId: string) => {
      spies.lookupOrder?.();
      return { id: orderId, userId: 'someone-else' };
    },
    updateShippingAddress: async () => {
      spies.updateShippingAddress?.();
      return 'updated';
    },
    fetchUrl: async () => {
      spies.fetchUrl?.();
      return 'fetched';
    },
    searchProducts: async () => {
      spies.searchProducts?.();
      return [];
    },
    createReview: async () => {
      spies.createReview?.();
      return 'review created';
    },
    downloadFile: async () => {
      spies.downloadFile?.();
      return 'file contents';
    },
  });
}

/** Stub the remote model so the tool-gating logic can be exercised without an OpenAI call. */
function stubModel(agent: AgentService, toolName: string, args: Record<string, unknown>) {
  let call = 0;
  (agent as unknown as { model: { invoke: (...a: unknown[]) => unknown } }).model = {
    invoke: async () =>
      call++ === 0
        ? { content: '', tool_calls: [{ name: toolName, args, id: 'call-1' }] }
        : { content: 'done', tool_calls: [] },
  };
}

describe('Agent tool access tiers', () => {
  it('refuses authenticated-only tools for anonymous callers without executing them', async () => {
    let executed = false;
    const agent = buildAgent(false, { lookupOrder: () => { executed = true; } });
    stubModel(agent, 'lookup_order', { orderId: 'order-999' });

    const result = await agent.chat('look up order 999');

    expect(executed).toBe(false);
    expect(result.authenticated).toBe(false);
    expect(result.toolCalls[0]).toMatchObject({ tool: 'lookup_order', denied: true, output: SIGN_IN_MESSAGE });
  });

  it('runs authenticated-only tools when the caller is signed in', async () => {
    let executed = false;
    const agent = buildAgent(true, { lookupOrder: () => { executed = true; } });
    stubModel(agent, 'lookup_order', { orderId: 'order-999' });

    const result = await agent.chat('look up order 999');

    expect(executed).toBe(true);
    expect(result.authenticated).toBe(true);
    expect(result.toolCalls[0].denied).toBe(false);
    // The CWE-639 demo must survive the auth tiering: a signed-in user still sees someone else's order.
    expect(result.toolCalls[0].output).toContain('someone-else');
  });

  it.each(PUBLIC_TOOLS)('runs the public tool %s for anonymous callers', async (toolName) => {
    const args: Record<string, Record<string, unknown>> = {
      search_products: { keywords: 'ibuprofen' },
      fetch_url: { url: 'http://example.com' },
      create_review: { productId: 'p1', rating: 5, comment: 'ok' },
    };
    let executed = false;
    const spyKey = { search_products: 'searchProducts', fetch_url: 'fetchUrl', create_review: 'createReview' }[toolName];
    const agent = buildAgent(false, { [spyKey]: () => { executed = true; } });
    stubModel(agent, toolName, args[toolName]);

    const result = await agent.chat('hello');

    expect(executed).toBe(true);
    expect(result.toolCalls[0].denied).toBe(false);
  });

  it('gates exactly the order, shipping and file tools', () => {
    expect([...AUTH_REQUIRED_TOOLS].sort()).toEqual(['change_shipping_address', 'download_file', 'lookup_order']);
  });
});
