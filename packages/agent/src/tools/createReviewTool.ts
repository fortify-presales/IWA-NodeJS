import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export type ReviewCreator = (productId: string, rating: number, comment: string) => Promise<string>;

export function createReviewTool(createReview: ReviewCreator) {
  return tool(
    async ({ productId, rating, comment }: { productId: string; rating: number; comment: string }) =>
      createReview(productId, rating, comment),
    {
      name: 'create_review',
      description: 'Create a product review with a rating and comment.',
      schema: z.object({
        productId: z.string().describe('The product ID being reviewed'),
        rating: z.number().int().min(1).max(5).describe('The product rating from 1 to 5'),
        comment: z.string().describe('The review comment'),
      }),
    },
  );
}
