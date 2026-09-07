import React from 'react';
import { MagnifyingGlassIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { addToCart } from './cart';
import { getJson, Product, ProductListData, Review } from './api';

type CatalogProps = {
  currency: string;
};

function formatPrice(value: number | string) {
  return Number(value || 0).toFixed(2);
}

function imageSrc(product: Product, fallback: string) {
  if (!product.image) return fallback;
  return product.image.startsWith('/img/') ? product.image : `/img/products/${product.image}`;
}

function productUrl(productId: string) {
  return `/app/products/${productId}`;
}

export function ProductCatalog({ currency }: CatalogProps) {
  const productId = window.location.pathname.match(/^\/app\/products\/([^/]+)/)?.[1];
  return productId ? <ProductDetail currency={currency} productId={productId} /> : <ProductList currency={currency} />;
}

function ProductList({ currency }: CatalogProps) {
  const [keywords, setKeywords] = React.useState(new URLSearchParams(window.location.search).get('keywords') ?? '');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [status, setStatus] = React.useState('Loading products');

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const searchKeywords = query.get('keywords') ?? '';
    const path = searchKeywords ? `/api/v3/products?keywords=${encodeURIComponent(searchKeywords)}` : '/api/v3/products';
    setStatus('Loading products');

    getJson<ProductListData>(path)
      .then((data) => {
        setProducts(data.rows);
        setStatus('');
      })
      .catch((error: Error) => setStatus(error.message));
  }, []);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = keywords.trim() ? `?keywords=${encodeURIComponent(keywords.trim())}` : '';
    window.location.href = `/app/products${query}`;
  }

  return (
    <section className="page-frame catalog-page">
      <div className="page-kicker"><a href="/app/products">Shop</a></div>
      <h1 className="mb-4">All Products</h1>

      {keywords ? (
        <div className="search-banner">
          <span>Searching for</span>
          <ReflectedSearchTerm html={keywords} />
        </div>
      ) : null}

      <form className="search-form" onSubmit={submitSearch}>
        <div className="relative">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted"
          />
          <input
            aria-label="Search products"
            className="pl-10"
            name="keywords"
            onChange={(event) => setKeywords(event.target.value)}
            placeholder="Enter search keywords"
            type="search"
            value={keywords}
          />
        </div>
        <button type="submit">
          <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
          Search
        </button>
      </form>

      {status ? <p className="status-line">{status}</p> : null}

      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            {product.onSale ? <span className="sale-tag">Sale</span> : null}
            <a href={productUrl(product.id)}>
              <img src={imageSrc(product, '/img/awaiting-image-sm.png')} alt={product.name} />
            </a>
            <h2><a href={productUrl(product.id)}>{product.name}</a></h2>
            <Price currency={currency} product={product} />
            <button type="button" onClick={() => addToCart(product.id, 1)}>
              <ShoppingCartIcon className="h-5 w-5" aria-hidden="true" />
              Add to Cart
            </button>
          </article>
        ))}
      </div>

      {!status && products.length === 0 ? <p className="status-line">No products found.</p> : null}
      {!status ? <p className="result-count">{keywords ? 'Found' : 'Showing'} {products.length} products</p> : null}
    </section>
  );
}

function ProductDetail({ currency, productId }: CatalogProps & { productId: string }) {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [quantity, setQuantity] = React.useState(1);
  const [status, setStatus] = React.useState('Loading product');

  React.useEffect(() => {
    Promise.all([
      getJson<Product>(`/api/v3/products/${productId}`),
      getJson<Review[]>(`/api/v3/reviews?pid=${encodeURIComponent(productId)}`),
    ])
      .then(([productData, reviewData]) => {
        setProduct(productData);
        setReviews(reviewData);
        setStatus('');
      })
      .catch((error: Error) => setStatus(error.message));
  }, [productId]);

  if (status) return <p className="status-line page-frame">{status}</p>;
  if (!product) return <p className="status-line page-frame">Product not found.</p>;

  return (
    <section className="page-frame detail-page">
      <div className="page-kicker"><a href="/app/products">Shop</a> / <strong>{product.name}</strong></div>
      <div className="detail-layout">
        <div>
          <div className="product-image-frame">
            <img src={imageSrc(product, '/img/awaiting-image.png')} alt={product.name} />
          </div>
          <table className="product-info">
            <tbody>
              <tr><th scope="row">Code:</th><td>{product.code}</td></tr>
              <tr><th scope="row">Manufacturer:</th><td>Unknown</td></tr>
              <tr><th scope="row">Contents:</th><td>Unspecified</td></tr>
              <tr><th scope="row">Date First Available:</th><td>{new Date(product.dateCreated).toLocaleDateString()}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="item-entry">
          <h1>{product.name}</h1>
          <StarRating rating={product.rating} reviewCount={reviews.length} />
          <h2>Summary</h2>
          <p>{product.summary}</p>
          <h2>Description</h2>
          <p>{product.description}</p>
          <div className="detail-price"><Price currency={currency} product={product} /> <StockBadge product={product} /></div>
          <div className="quantity-row">
            <input
              aria-label="Quantity"
              min="1"
              onChange={(event) => setQuantity(Number(event.target.value) || 1)}
              type="number"
              value={quantity}
            />
            <button disabled={!product.inStock} onClick={() => addToCart(product.id, quantity)} type="button">
              <ShoppingCartIcon className="h-5 w-5" aria-hidden="true" />
              Add To Cart
            </button>
          </div>
        </div>
      </div>

      <section className="reviews" id="reviews-start">
        <h2>Customer Reviews</h2>
        {reviews.map((review) => (
          <article className="review-card" key={review.id}>
            <StoredReviewComment html={review.comment} />
            <small>Rating: {review.rating}/5 - {review.user?.username ?? 'Anonymous'}</small>
          </article>
        ))}
        {reviews.length === 0 ? <p>No reviews yet.</p> : null}
      </section>
    </section>
  );
}

function ReflectedSearchTerm({ html }: { html: string }) {
  // INSECURE: keywords reflected into DOM without escaping (CWE-79)
  // Purpose: demonstrates reflected XSS in the modern React frontend for Fortify SAST/DAST
  // Fix: render user-controlled text normally so React escapes it
  return <strong dangerouslySetInnerHTML={{ __html: html }} />;
}

function StoredReviewComment({ html }: { html: string }) {
  // INSECURE: stored review comments rendered as HTML (CWE-79)
  // Purpose: demonstrates stored XSS in the modern React frontend for Fortify SAST/DAST
  // Fix: render review comments as text and sanitize stored content before display
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function Price({ currency, product }: CatalogProps & { product: Product }) {
  if (product.onSale) {
    return <p className="price"><del>{currency} {formatPrice(product.price)}</del> <span>{currency} {formatPrice(product.salePrice)}</span></p>;
  }
  return <p className="price"><span>{currency} {formatPrice(product.price)}</span></p>;
}

function StockBadge({ product }: { product: Product }) {
  return <span className={product.inStock ? 'stock in' : 'stock out'}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>;
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return (
    <div className="rating">
      {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)} <a href="#reviews-start">Customer Reviews</a> ({reviewCount})
    </div>
  );
}
