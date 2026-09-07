import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export type UrlFetcher = (url: string) => Promise<string>;

export function createUrlFetchTool(fetchUrl: UrlFetcher) {
  return tool(
    async ({ url }: { url: string }) => {
      const body = await fetchUrl(url);
      return body.slice(0, 4000);
    },
    {
      name: 'fetch_url',
      description: 'Fetch the raw text content of a URL, e.g. a manufacturer or product info page.',
      schema: z.object({ url: z.string().describe('The absolute URL to fetch') }),
    },
  );
}

