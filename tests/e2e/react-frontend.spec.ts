import { expect, test } from '@playwright/test';

async function login(page: Parameters<typeof test>[0] extends never ? never : any, username: string, redirect: string) {
  await page.goto(`/app/login?redirect=${encodeURIComponent(redirect)}`);
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill('Password123!');
  await Promise.all([
    page.waitForURL(`**${redirect}`),
    page.locator('#login-submit').click(),
  ]);
}

test('routes legacy public pages to the React frontend', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/app\/$/);
  await expect(page.getByRole('heading', { name: 'Welcome to IWA Pharmacy Direct' })).toBeVisible();

  await page.goto('/products?keywords=para');
  await expect(page).toHaveURL(/\/app\/products\?keywords=para$/);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.nav-menu')).toHaveCount(3);
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
});

test('admins can access the React dashboard and management data', async ({ page }) => {
  await login(page, 'admin', '/app/admin');
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  await expect(page.locator('.admin-stat')).toHaveCount(4);

  await page.goto('/app/admin/users');
  await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
  await expect(page.locator('.data-table tbody tr')).toHaveCount(5);
});