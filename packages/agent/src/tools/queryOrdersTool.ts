import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export type OrderLookup = (orderId: string) => Promise<Record<string, unknown> | null>;

export function createOrderLookupTool(lookupOrder: OrderLookup) {
  return tool(
    async ({ orderId }: { orderId: string }) => {
      const order = await lookupOrder(orderId);
      return order ? JSON.stringify(order) : `No order found for id ${orderId}`;
    },
    {
      name: 'lookup_order',
      description: 'Look up an order by its UUID or human-readable order number and return its details (customer, items, address).',
      schema: z.object({ orderId: z.string().describe('The order UUID or order number, such as ORD-001') }),
    },
  );
}

