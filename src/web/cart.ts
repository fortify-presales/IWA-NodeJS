import { Router, Request, Response, NextFunction } from 'express';
import { productService } from '../services/ProductService.js';
import { orderService } from '../services/OrderService.js';

const router = Router();

interface CartItem { id: string; name: string; qty: number; price: number; }
interface ReactCartItem { pid: string; quantity: number; }

function getCart(req: Request): CartItem[] {
  return (req.session as any).cart || [];
}

router.get('/cart', (req: Request, res: Response) => {
  res.redirect(301, '/app/cart');
});

router.post('/cart/add', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, qty } = req.body;
    const product = await productService.findById(productId);
    if (!product) return res.redirect('/app/products');
    const cart: CartItem[] = (req.session as any).cart || [];
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.qty += parseInt(qty) || 1;
    else cart.push({ id: product.id, name: product.name, qty: parseInt(qty) || 1, price: product.onSale ? product.salePrice : product.price });
    (req.session as any).cart = cart;
    res.redirect('/app/cart');
  } catch (err) { next(err); }
});

router.post('/cart/update', (req: Request, res: Response) => {
  const { productId, qty } = req.body;
  const cart: CartItem[] = (req.session as any).cart || [];
  const item = cart.find(i => i.id === productId);
  if (item) item.qty = parseInt(qty) || 1;
  (req.session as any).cart = cart;
  res.redirect('/app/cart');
});

router.post('/cart/remove', (req: Request, res: Response) => {
  const { productId } = req.body;
  (req.session as any).cart = ((req.session as any).cart || []).filter((i: CartItem) => i.id !== productId);
  res.redirect('/app/cart');
});

router.post('/cart/checkout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.isAuthenticated()) {
      const redirect = req.body.appReturnTo === '/app/cart' ? '/app/cart' : '/cart';
      return res.redirect('/app/login?redirect=' + encodeURIComponent(redirect));
    }

    const cart = req.body.cartJson ? await buildCartFromReactPayload(String(req.body.cartJson)) : getCart(req);
    if (!cart.length) return res.redirect(req.body.appReturnTo === '/app/cart' ? '/app/cart' : '/cart');
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
    res.redirect(req.body.appReturnTo === '/app/cart' ? '/app/user/orders' : '/user/orders');
  } catch (err) { next(err); }
});

async function buildCartFromReactPayload(cartJson: string): Promise<CartItem[]> {
  let items: ReactCartItem[];
  try {
    items = JSON.parse(cartJson) as ReactCartItem[];
  } catch {
    return [];
  }
  if (!Array.isArray(items)) return [];
  const cart: CartItem[] = [];
  for (const item of items) {
    if (!item.pid) continue;
    const product = await productService.findById(item.pid);
    if (!product) continue;
    cart.push({
      id: product.id,
      name: product.name,
      qty: parseInt(String(item.quantity), 10) || 1,
      price: Number(product.onSale ? product.salePrice : product.price),
    });
  }
  return cart;
}

export { router as cartRouter };
