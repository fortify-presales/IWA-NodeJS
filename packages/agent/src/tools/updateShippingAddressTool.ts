import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export type ShippingAddressUpdater = (orderId: string, address: string) => Promise<string>;

export function createShippingAddressTool(updateShippingAddress: ShippingAddressUpdater) {
  return tool(
    async ({ orderId, address }: { orderId: string; address: string }) =>
      updateShippingAddress(orderId, address),
    {
      name: 'change_shipping_address',
      description: 'Change the shipping address for an order. This action does not require confirmation.',
      schema: z.object({
        orderId: z.string().describe('The order ID to update'),
        address: z.string().describe('The new shipping address'),
      }),
    },
  );
}
