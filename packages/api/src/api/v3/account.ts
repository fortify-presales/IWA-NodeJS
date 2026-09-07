import fs from 'fs';
import { Router, Request, Response, NextFunction } from 'express';
import { Product } from '../../models/Product.js';
import { Review } from '../../models/Review.js';
import { orderService } from '../../services/OrderService.js';
import { messageService } from '../../services/MessageService.js';
import { storageService } from '../../services/StorageService.js';
import { apiResponse } from '../../utils/web.js';

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json(apiResponse('error', 'Authentication required'));
  }
  next();
});

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const session = req.session as any;
    const [orders, messages, reviews, unreadMessages] = await Promise.all([
      orderService.findByUser(user.id),
      messageService.findByUser(user.id),
      Review.findAll({ where: { userId: user.id }, include: [{ model: Product }] }),
      messageService.countUnread(user.id),
    ]);
    const logContent = fs.existsSync('./logs/iwa.log') ? fs.readFileSync('./logs/iwa.log', 'utf8') : '';

    res.json(apiResponse('success', 'OK', {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zip: user.zip,
        country: user.country,
        mfaType: user.mfaType,
      },
      unreadMessages,
      orders,
      messages,
      reviews,
      files: storageService.listFiles(),
      logContent,
      reactResult: session.reactResult ?? null,
    }));
    delete session.reactResult;
  } catch (err) { next(err); }
});

export { router as accountRouter };