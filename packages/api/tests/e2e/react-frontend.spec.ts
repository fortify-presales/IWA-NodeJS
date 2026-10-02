import { expect, test } from '@playwright/test';
import speakeasy from 'speakeasy';
import { verificationService } from '../../src/services/VerificationService.js';

async function login(page: Parameters<typeof test>[0] extends never ? never : any, username: string, redirect: string) {
  await page.goto(`/app/login?redirect=${encodeURIComponent(redirect)}`);
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill('Password123!');
  await Promise.all([
    page.waitForURL(/\/app\/(login-mfa|.*)/),
    page.locator('#login-submit').click(),
  ]);
  if (page.url().includes('/app/login-mfa')) {
    const secret = verificationService.generateDeterministicTotpSecret(username);
    await page.locator('input[name="code"]').fill(speakeasy.totp({ secret, encoding: 'base32' }));
    await Promise.all([
      page.waitForURL(`**${redirect}`),
      page.getByRole('button', { name: 'Verify' }).click(),
    ]);
  }
  await page.waitForURL(`**${redirect}`);
}

test('routes legacy public pages to the React frontend', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/app\/$/);
  await expect(page.getByRole('heading', { name: 'Welcome to IWA Pharmacy Direct' })).toBeVisible();
  const olivePopup = page.getByRole('link', { name: 'Ask Olive, open AI Assistant' });
  await expect(olivePopup).toBeVisible();
  await expect(olivePopup.locator('img')).toHaveAttribute('src', '/img/olive-avatar.png');

  await page.goto('/products?keywords=para');
  await expect(page).toHaveURL(/\/app\/products\?keywords=para$/);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.nav-menu')).toHaveCount(3);

  await page.goto('/app/');
  await page.getByRole('link', { name: 'Ask Olive, open AI Assistant' }).click();
  await expect(page).toHaveURL(/\/app\/assistant$/);
});

test('adds products to the React cart and checks out through the backend', async ({ page }) => {
  await page.goto('/app/products');
  await page.locator('.product-card button').first().click();
  await expect(page.locator('.cart-count')).toHaveText('1');

  await page.locator('.cart-link').click();
  await expect(page).toHaveURL(/\/app\/cart$/);
  await expect(page.locator('.cart-table tbody tr')).toHaveCount(1);

  await page.locator('.cart-table input[type="number"]').fill('2');
  await expect(page.locator('.cart-count')).toHaveText('2');

  await page.getByRole('button', { name: 'Login To Checkout' }).click();
  await expect(page).toHaveURL(/\/app\/login\?redirect=%2Fapp%2Fcart$/);
  await login(page, 'user1', '/app/cart');

  await page.getByRole('button', { name: 'Proceed To Checkout' }).click();
  await expect(page).toHaveURL(/\/app\/user\/orders$/);
  await expect(page.locator('.data-table tbody tr')).toHaveCount(3);
  await expect(page.locator('.cart-count')).toHaveText('0');
});

test('normal users can access their React account but not the admin UI', async ({ page }) => {
  await login(page, 'user1', '/app/user/home');
  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();
  await expect(page.locator('.account-tile')).toHaveCount(4);

  await page.goto('/app/admin');
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
  await expect(page.getByText('Admin access required')).toBeVisible();

  await page.goto('/logout');
  const response = await page.request.get('/app/user/home');
  expect(response.status()).toBe(401);
  expect(await response.text()).toBe('Authentication required');
});

test('admins can access the React dashboard and management data', async ({ page }) => {
  await login(page, 'admin', '/app/admin');
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  await expect(page.locator('.admin-stat')).toHaveCount(4);

  await page.goto('/app/admin/users');
  await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
  await expect(page.locator('.data-table tbody tr')).toHaveCount(5);
});

test('user and admin log pages provide searchable scroll windows', async ({ page }) => {
  for (const { username, route } of [
    { username: 'user1', route: '/app/user/log' },
    { username: 'admin', route: '/app/admin/log' },
  ]) {
    await login(page, username, route);

    const logWindow = page.locator('.log-window');
    const search = page.getByRole('searchbox', { name: 'Search log entries' });
    await expect(logWindow).toBeVisible();
    await expect(logWindow).toHaveCSS('overflow-y', 'auto');
    await expect(logWindow).toHaveCSS('height', '384px');
    await expect.poll(async () => logWindow.evaluate(element => (
      element.scrollTop + element.clientHeight >= element.scrollHeight - 1
    ))).toBe(true);

    await search.fill('no-such-log-entry');
    await expect(page.getByRole('status')).toHaveText('No matching log entries.');
    await expect(logWindow).toBeEmpty();

    await search.fill(route);
    await expect(logWindow).toContainText(route);

    if (username === 'user1') await page.goto('/logout');
  }
});