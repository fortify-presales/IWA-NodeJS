import { Router, Request, Response, NextFunction } from 'express';
import { AgentService } from '@iwa/agent';
import { orderRepository } from '../../repositories/OrderRepository.js';
import { productRepository } from '../../repositories/ProductRepository.js';
import { reviewService } from '../../services/ReviewService.js';
import { storageService } from '../../services/StorageService.js';
import { apiResponse } from '../../utils/web.js';

const router = Router();

// INSECURE: anonymous callers reach the fetch_url (CWE-918) and create_review (CWE-79) tools with no auth (CWE-306)
// Purpose: demonstrates pre-authentication reachability of agent tool vulnerabilities
// Fix: require authentication for every state-changing or outbound-request tool
function createAgent(apiKey: string, authenticated: boolean): AgentService {
  return new AgentService({
    authenticated,
    lookupOrder: async (orderId) => {
      // INSECURE: agent tool returns any order without checking ownership (CWE-639)
      // Purpose: demonstrates excessive agency / broken object-level authorization through an agent tool
      // Fix: scope the lookup to the authenticated user before returning order data
      const order = await orderRepository.findById(orderId);
      return order ? { ...order.toJSON(), url: '/app/user/orders', invoiceUrl: `/user/orders/${orderId}/invoice.pdf` } : null;
    },
    // INSECURE: model-requested address changes run without confirmation or ownership checks (CWE-862)
    // Purpose: demonstrates excessive agency for a sensitive state-changing action
    // Fix: require explicit confirmation and authorize the update for the authenticated order owner
    updateShippingAddress: async (orderId, address) => {
      await orderRepository.update(orderId, { shippingAddress: address });
      return `Shipping address updated for order ${orderId}. Review it at /app/user/orders`;
    },
    // INSECURE: model-controlled URL is fetched without host or private-address filtering (CWE-918)
    // Purpose: demonstrates SSRF through an agent tool, including indirect prompt injection
    // Fix: allow-list hosts and block private, link-local, and metadata address ranges
    fetchUrl: async (url) => {
      const response = await fetch(url);
      return response.text();
    },
    // INSECURE: product descriptions become trusted model context (CWE-1427)
    // Purpose: demonstrates indirect prompt injection through business data
    // Fix: label retrieved content as untrusted data and prevent it from becoming instructions
    searchProducts: async (keywords) => {
      const result = await productRepository.search(keywords);
      return result.rows.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        url: `/app/products/${product.id}`,
      }));
    },
    // INSECURE: model-controlled review content is persisted without sanitization (CWE-79)
    // Purpose: demonstrates model output crossing into stored business data and later HTML rendering
    // Fix: validate ownership and encode or sanitize review content at the rendering boundary
    createReview: async (productId, rating, comment) => {
      const review = await reviewService.create({ productId, rating, comment });
      return `Review ${review.id} created for product ${productId}. View it at /app/products/${productId}#reviews-start or in /app/user/reviews`;
    },
    // INSECURE: model-controlled path is read with traversal enabled (CWE-22)
    // Purpose: demonstrates agent-mediated arbitrary file disclosure
    // Fix: normalize the path and verify it remains under the upload root
    downloadFile: async (filename) => storageService.loadAsResource(filename, true).toString('utf8').slice(0, 4000),
    apiKey,
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  });
}

function getOpenAiApiKey(req: Request): string | null {
  const browserKey = req.header('X-OpenAI-API-Key')?.trim();
  if (browserKey) return browserKey;

  if (process.env.ALLOW_SERVER_OPENAI_API_KEY === 'true') {
    return process.env.OPENAI_API_KEY?.trim() || null;
  }

  return null;
}

/**
 * @openapi
 * /agent/chat:
 *   post:
 *     tags: [Agent]
 *     summary: Chat with the IWA Pharmacy Direct AI assistant
 *     description: >
 *       Callable anonymously. Order lookup, shipping address changes and file downloads are
 *       refused unless the caller has an authenticated session.
 *     security: []
 *     responses:
 *       200:
 *         description: Agent reply
 */
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, conversationId } = req.body as { message?: unknown; conversationId?: string };
    if (!message || typeof message !== 'string') {
      return res.status(400).json(apiResponse('error', 'message is required'));
    }
    const apiKey = getOpenAiApiKey(req);
    if (!apiKey) {
      return res.status(503).json(apiResponse('error', 'Enter your OpenAI API key in the assistant settings.'));
    }
    const authenticated = Boolean(req.isAuthenticated?.() && req.user);
    const result = await createAgent(apiKey, authenticated).chat(message, conversationId);
    res.json(apiResponse('success', 'OK', result));
  } catch (err) { next(err); }
});

export { router as agentRouter };
