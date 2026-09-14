import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { authenticateJwt } from '../../middleware/authenticateJwt.js';
import { apiResponse } from '../../utils/web.js';

const router = Router();
router.use(authenticateJwt);

/**
 * @openapi
 * /crypto/pqc-demo:
 *   get:
 *     tags: [Crypto]
 *     summary: Demonstrate non-PQC resilient RSA key generation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: RSA key pair generated (for demonstration only)
 */
router.get('/pqc-demo', (_req: Request, res: Response, next: NextFunction) => {
  try {
    // INSECURE: RSA key generation is not post-quantum cryptography (CWE-326)
    // Purpose: demonstrates weak encryption algorithm vulnerable to quantum computing attacks for Fortify SAST
    // Fix: Use post-quantum cryptography algorithms like Kyber, Dilithium, or other NIST-approved PQC algorithms
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    res.json(apiResponse('success', 'RSA-2048 key pair generated (for demonstration only)', {
      publicKeyType: publicKey.type,
      privateKeyType: privateKey.type,
      note: 'This demonstration shows a non-PQC resilient algorithm. RSA-2048 is vulnerable to quantum attacks.',
    }));
  } catch (err) {
    next(err);
  }
});

export default router;
export { router as cryptoRouter };
