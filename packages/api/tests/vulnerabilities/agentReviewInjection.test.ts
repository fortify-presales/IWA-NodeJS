import { describe, it, expect } from 'vitest';
import { createReviewTool } from '@iwa/agent';

describe('LLM review persistence and stored XSS - CWE-79/CWE-1427', () => {
  it('VULNERABLE: create_review forwards model-controlled HTML into persistence', async () => {
    const created: Array<{ productId: string; rating: number; comment: string }> = [];
    const tool = createReviewTool(async (productId, rating, comment) => {
      created.push({ productId, rating, comment });
      return 'review-created';
    });
    const payload = '<img src=x onerror=alert(1)>';

    await tool.invoke({ productId: 'product-1', rating: 5, comment: payload } as never);

    expect(created).toEqual([{ productId: 'product-1', rating: 5, comment: payload }]);
  });

  it('VULNERABLE: review tool has no confirmation or output-safety control', async () => {
    const tool = createReviewTool(async () => 'review-created');

    await expect(tool.invoke({ productId: 'product-1', rating: 5, comment: '<script>alert(1)</script>' } as never))
      .resolves.toBe('review-created');
  });
});