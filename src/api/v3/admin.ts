import fs from 'fs';
import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../../models/User.js';
import { Product } from '../../models/Product.js';
import { Order } from '../../models/Order.js';
import { Review } from '../../models/Review.js';
import { Message } from '../../models/Message.js';
import { apiResponse } from '../../utils/web.js';

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json(apiResponse('error', 'Authentication required'));
  }
  const user = req.user as any;
  const roles = (user.authorities ?? []).map((authority: any) => authority.name);
  if (!roles.includes('ROLE_ADMIN')) {
    return res.status(403).json(apiResponse('error', 'Admin access required'));
  }
  next();
});

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as any;
    const [users, products, orders, reviews, messages] = await Promise.all([
      User.findAll({ include: [{ all: true }] }),
      Product.findAll(),
      Order.findAll({ include: [{ all: true }] }),
      Review.findAll({ include: [{ all: true }] }),
      Message.findAll({ include: [{ all: true }] }),
    ]);
    const logContent = fs.existsSync('./logs/iwa.log') ? fs.readFileSync('./logs/iwa.log', 'utf8') : '';

    res.json(apiResponse('success', 'OK', {
      stats: {
        users: users.length,
        products: products.length,
        orders: orders.length,
        reviews: reviews.length,
        messages: messages.length,
      },
      users,
      products,
      orders,
      reviews,
      messages,
      logContent,
      reactResult: session.adminReactResult ?? null,
    }));
    delete session.adminReactResult;
  } catch (err) { next(err); }
});

export { router as adminApiRouter };