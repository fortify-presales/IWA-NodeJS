import { Router, Request, Response, NextFunction } from 'express';
import { productService } from '../services/ProductService.js';
import { orderService } from '../services/OrderService.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

interface CartItem { id: string; name: string; qty: number; price: number; }

function getCart(req: Request): CartItem[] {
  return (req.session as any).cart || [];
}

router.get('/cart', (req: Request, res: Response) => {
  const cart = getCart(req);
  const total = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
  res.render('cart/index', { title: 'Shopping Cart', cart, total });
});

router.post('/cart/add', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, qty } = req.body;
    const product = await productService.findById(productId);
    if (!product) return res.redirect('/products');
    const cart: CartItem[] = (req.session as any).cart || [];
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.qty += parseInt(qty) || 1;
    else cart.push({ id: product.id, name: product.name, qty: parseInt(qty) || 1, price: product.onSale ? product.salePrice : product.price });
    (req.session as any).cart = cart;
    res.redirect('/cart');
  } catch (err) { next(err); }
});

router.post('/cart/update', (req: Request, res: Response) => {
  const { productId, qty } = req.body;
  const cart: CartItem[] = (req.session as any).cart || [];
  const item = cart.find(i => i.id === productId);
  if (item) item.qty = parseInt(qty) || 1;
  (req.session as any).cart = cart;
  res.redirect('/cart');
});

router.post('/cart/remove', (req: Request, res: Response) => {
  const { productId } = req.body;
  (req.session as any).cart = ((req.session as any).cart || []).filter((i: CartItem) => i.id !== productId);
  res.redirect('/cart');
});

router.post('/cart/checkout', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = getCart(req);
    if (!cart.length) return res.redirect('/cart');
    const user = req.user as any;
    const amount = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
    await orderService.create({
      orderNum: 'ORD-' + Date.now(),
      amount,
      cart: JSON.stringify(cart),
      shipped: false,
      userId: user.id,
    } as any);
    (req.session as any).cart = [];
    res.redirect('/user/orders');
  } catch (err) { next(err); }
});

export { router as cartRouter };
