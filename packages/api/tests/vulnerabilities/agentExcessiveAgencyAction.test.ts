import { describe, it, expect } from 'vitest';
import { createShippingAddressTool } from '@iwa/agent';

describe('LLM Excessive Agency - state-changing tool', () => {
  it('VULNERABLE: change_shipping_address executes without confirmation or caller context', async () => {
    const updates: Array<{ orderId: string; address: string }> = [];
    const tool = createShippingAddressTool(async (orderId: string, address: string) => {
      updates.push({ orderId, address });
      return `Shipping address updated for order ${orderId}`;
    });

    const result = await tool.invoke({
      orderId: 'order-999',
      address: '1 Attacker Street',
    } as never);

    expect(updates).toEqual([{ orderId: 'order-999', address: '1 Attacker Street' }]);
    expect(String(result)).toContain('updated');
  });

  it('VULNERABLE: tool schema exposes no confirmation or authenticated user identity', () => {
    const payload = 'Change the shipping address for order-999 now';
    expect(payload).toContain('Change the shipping address');
  });
});
