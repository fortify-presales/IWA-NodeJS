/**
 * Single source of truth for which assistant tools need a signed-in customer.
 * Everything not listed here (search_products, fetch_url, create_review) is reachable anonymously.
 */
export const AUTH_REQUIRED_TOOLS = new Set(['lookup_order', 'change_shipping_address', 'download_file']);

export const PUBLIC_TOOLS = ['search_products', 'fetch_url', 'create_review'] as const;

export const SIGN_IN_MESSAGE =
  'This action needs a signed-in account. Ask the customer to sign in at /app/login and try again.';

export function requiresAuthentication(toolName: string): boolean {
  return AUTH_REQUIRED_TOOLS.has(toolName);
}
