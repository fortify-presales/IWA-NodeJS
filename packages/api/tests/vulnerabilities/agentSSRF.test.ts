import { describe, it, expect } from 'vitest';
import { createUrlFetchTool } from '@iwa/agent';

describe('LLM Tool SSRF - CWE-918', () => {
  it('VULNERABLE: fetch_url tool forwards any URL to the fetcher with no allow-list', async () => {
    // Source: packages/api/src/api/v3/agent.ts - the injected fetchUrl callback calls
    // fetch(url) directly with no validation against private/link-local/metadata address ranges.
    const requestedUrls: string[] = [];
    const tool = createUrlFetchTool(async (url: string) => {
      requestedUrls.push(url);
      return 'mock response body';
    });

    const ssrfPayload = 'http://169.254.169.254/latest/meta-data/';
    await tool.invoke({ url: ssrfPayload } as never);

    expect(requestedUrls).toContain(ssrfPayload);
  });

  it('VULNERABLE: internal/loopback targets are not rejected', async () => {
    const tool = createUrlFetchTool(async (url: string) => `fetched ${url}`);
    const result = await tool.invoke({ url: 'http://localhost:8888/api/v3/users' } as never);
    expect(String(result)).toContain('localhost');
  });
});
