import React from 'react';
import { CartItem, cartUpdatedEvent, clearCart, readCart, removeCartItem, replaceCart, serializeCart, updateCartItem } from './cart';
import { getJson, Product } from './api';

type CartPageProps = {
  currency: string;
  user: null | { username: string };
};

type CartProduct = Product & { quantity: number };

function price(product: Product) {
  return Number(product.onSale ? product.salePrice : product.price || 0);
}

function imageSrc(product: Product) {
  if (!product.image) return '/img/awaiting-image-sm.png';
  return product.image.startsWith('/img/') ? product.image : `/img/products/${product.image}`;
}

export function CartPage({ currency, user }: CartPageProps) {
  const [items, setItems] = React.useState<CartProduct[]>([]);
  const [status, setStatus] = React.useState('Loading cart');

  React.useEffect(() => {
    loadCartProducts().then((products) => {
      setItems(products);
      setStatus('');
    }).catch((error: Error) => setStatus(error.message));
  }, []);

  function setQuantity(pid: string, quantity: number) {
    updateCartItem(pid, quantity);
    setItems((current) => current.map((item) => item.id === pid ? { ...item, quantity: Math.max(1, quantity) } : item));
  }

  function remove(pid: string) {
    removeCartItem(pid);
    setItems((current) => current.filter((item) => item.id !== pid));
  }

  const total = items.reduce((sum, item) => sum + price(item) * item.quantity, 0);

  if (status) return <p className="status-line">{status}</p>;

  return (
    <section className="content-page cart-page">
      <div className="page-kicker"><a href="/app/products">Shop</a> / <strong>Cart</strong></div>
      <h1>Shopping Cart</h1>
      {items.length === 0 ? (
        <div className="notice">Your shopping cart is empty. <a href="/app/products">Continue Shopping</a></div>
      ) : (
        <>
          <div className="data-table-wrap">
            <table className="data-table cart-table">
              <thead><tr><th>Product</th><th>Quantity</th><th>Total</th><th>Remove</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="cart-product"><img src={imageSrc(item)} alt={item.name} /><span>{item.name}</span></td>
                    <td><input aria-label={`Quantity for ${item.name}`} min="1" onChange={(event) => setQuantity(item.id, Number(event.target.value) || 1)} type="number" value={item.quantity} /></td>
                    <td>{currency} {(price(item) * item.quantity).toFixed(2)}</td>
                    <td><button type="button" onClick={() => remove(item.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cart-actions">
            <a className="button secondary outline" href="/app/products">Continue Shopping</a>
            <button className="button secondary outline" onClick={() => { clearCart(); setItems([]); }} type="button">Clear Cart</button>
            <div className="cart-total">Cart Total: <strong>{currency} {total.toFixed(2)}</strong></div>
            <form method="POST" action="/cart/checkout" onSubmit={() => { if (user) clearCart(); }}>
              <input type="hidden" name="appReturnTo" value="/app/cart" />
              <input type="hidden" name="cartJson" value={serializeCart()} />
              <button type="submit">{user ? 'Proceed To Checkout' : 'Login To Checkout'}</button>
            </form>
          </div>
        </>
      )}
    </section>
  );
}

export function CartCount() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    setCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
    const listener = () => setCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
    window.addEventListener(cartUpdatedEvent, listener);
    window.addEventListener('storage', listener);
    return () => {
      window.removeEventListener(cartUpdatedEvent, listener);
      window.removeEventListener('storage', listener);
    };
  }, []);

  return <span className="cart-count" aria-label={`${count} items in cart`}>{count}</span>;
}

async function loadCartProducts() {
  const cart = readCart();
  const results = await Promise.all(cart.map(async (item: CartItem) => {
    try {
      return { item, product: await getJson<Product>(`/api/v3/products/${item.pid}`) };
    } catch {
      return null;
    }
  }));
  const validResults = results.filter((result): result is { item: CartItem; product: Product } => result !== null);
  if (validResults.length !== cart.length) {
    replaceCart(validResults.map(({ item }) => item));
  }
  return validResults.map(({ item, product }) => ({ ...product, quantity: item.quantity }));
}