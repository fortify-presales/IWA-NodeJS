import { Router, Request, Response, NextFunction } from 'express';
import { AgentService } from '@iwa/agent';
import type { AgentChatRequest } from '@iwa/shared';
import { orderRepository } from '../../repositories/OrderRepository.js';
import { productRepository } from '../../repositories/ProductRepository.js';
import { apiResponse } from '../../utils/web.js';

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json(apiResponse('error', 'Authentication required'));
  }
  next();
});

// INSECURE: agent tool returns any order by ID with no check that it belongs to the requesting user (CWE-639)
// Purpose: demonstrates excessive agency / broken object level authorization via an LLM tool call
// Fix: scope the lookup to req.user.id (order.userId === req.user.id) before returning data to the model
let agent: AgentService | undefined;
function getAgent(): AgentService {
  if (!agent) {
    agent = new AgentService({
      lookupOrder: async (orderId: string) => {
        const order = await orderRepository.findById(orderId);
        return order ? order.toJSON() : null;
      },
      // INSECURE: executes a model-requested address change without user confirmation or ownership checks (CWE-862)
      // Purpose: demonstrates excessive agency when an LLM is allowed to perform a sensitive action
      // Fix: require explicit confirmation and authorize the update for the authenticated order owner
      updateShippingAddress: async (orderId: string, address: string) => {
        await orderRepository.update(orderId, { shippingAddress: address });
        return `Shipping address updated for order ${orderId}`;
      },
      // INSECURE: fetches any user/model-supplied URL with no allow-list or private-address filtering (CWE-918)
      // Purpose: demonstrates SSRF via an LLM agent tool call, including indirect prompt injection triggering it
      // Fix: validate the URL against an allow-list of hosts and block private/link-local/metadata address ranges
      fetchUrl: async (url: string) => {
        const response = await fetch(url);
        return response.text();
      },
      // INSECURE: returns attacker-controlled product descriptions as trusted model context (CWE-1427)
      // Purpose: demonstrates indirect prompt injection through business data retrieved by an agent tool
      // Fix: label retrieved content as untrusted data and prevent it from being treated as instructions
      searchProducts: async (keywords: string) => {
        const result = await productRepository.search(keywords);
        return result.rows.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
        }));
      },
    });
  }
  return agent;
}

/**
 * @openapi
 * /agent/chat:
 *   post:
 *     tags: [Agent]
 *     summary: Chat with the IWA Pharmacy Direct AI assistant
 *     responses:
 *       200:
 *         description: Agent reply
 */
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, conversationId } = req.body as AgentChatRequest;
    if (!message || typeof message !== 'string') {
      return res.status(400).json(apiResponse('error', 'message is required'));
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json(apiResponse('error', 'AI assistant is not configured: set OPENAI_API_KEY'));
    }
    const result = await getAgent().chat(message, conversationId);
    res.json(apiResponse('success', 'OK', result));
  } catch (err) { next(err); }
});

export { router as agentRouter };
