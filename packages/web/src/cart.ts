const cartKey = 'cart';
export const cartUpdatedEvent = 'iwa:cart-updated';

export type CartItem = {
  pid: string;
  quantity: number;
};

export function addToCart(pid: string, quantity: number) {
  const cart = readCart().filter((item) => item.pid !== pid);
  cart.push({ pid, quantity: Math.max(1, quantity) });
  writeCart(cart);
}

export function updateCartItem(pid: string, quantity: number) {
  const cart = readCart().map((item) => item.pid === pid ? { ...item, quantity: Math.max(1, quantity) } : item);
  writeCart(cart);
}

export function removeCartItem(pid: string) {
  writeCart(readCart().filter((item) => item.pid !== pid));
}

export function clearCart() {
  writeCart([]);
}

export function replaceCart(cart: CartItem[]) {
  writeCart(cart);
}

export function serializeCart() {
  return JSON.stringify(readCart());
}

export function readCart(): CartItem[] {
  const raw = localStorage.getItem(cartKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<Partial<CartItem>>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is CartItem => typeof item.pid === 'string' && typeof item.quantity === 'number')
      .map((item) => ({ pid: item.pid, quantity: Math.max(1, item.quantity) }));
  } catch {
    localStorage.removeItem(cartKey);
    return [];
  }
}

function writeCart(cart: CartItem[]) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent(cartUpdatedEvent, { detail: countCartItems(cart) }));
}

export function countCartItems(cart = readCart()) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}