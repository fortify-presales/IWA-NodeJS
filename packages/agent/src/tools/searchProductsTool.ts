import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export interface AgentProduct {
  id: string;
  name: string;
  description: string;
  url?: string;
}

export type ProductSearcher = (keywords: string) => Promise<AgentProduct[]>;

export function createProductSearchTool(searchProducts: ProductSearcher) {
  return tool(
    async ({ keywords }: { keywords: string }) => JSON.stringify(await searchProducts(keywords)),
    {
      name: 'search_products',
      description: 'Search products and return their names, descriptions and site URLs.',
      schema: z.object({ keywords: z.string().describe('Product name or topic to search for') }),
    },
  );
}
