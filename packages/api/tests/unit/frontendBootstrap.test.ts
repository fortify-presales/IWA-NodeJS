import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';

describe('frontend bootstrap', () => {
  it('returns public metadata for the React shell', async () => {
    const response = await request(createApp()).get('/api/v3/site/bootstrap');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toMatchObject({
      appName: 'IWA Pharmacy Direct',
      appVersion: '1.0.0',
      currency: 'GBP',
      user: null,
    });
  });

  it.each([
    '/app/', '/app/products', '/app/cart', '/app/vulnerabilities', '/app/assistant', '/app/login', '/app/register', '/app/forgot-password', '/app/login-mfa',
    '/app/user/home', '/app/user/profile', '/app/user/edit-profile', '/app/user/change-password', '/app/user/orders',
    '/app/user/messages', '/app/user/reviews', '/app/user/security', '/app/user/upload-file', '/app/user/import-settings',
    '/app/user/upload-xml-file', '/app/user/download-file', '/app/user/command-shell', '/app/user/log',
    '/app/admin', '/app/admin/users', '/app/admin/products', '/app/admin/orders', '/app/admin/reviews', '/app/admin/messages',
    '/app/admin/backup', '/app/admin/diagnostics', '/app/admin/command-shell', '/app/admin/log', '/app/admin/backdoor',
  ])('serves the React shell for %s', async (route) => {
    const response = await request(createApp()).get(route);

    expect(response.status).toBe(200);
    expect(response.text).toContain('<div id="root"></div>');
  });

  it('returns JSON auth errors for the React account API', async () => {
    const response = await request(createApp()).get('/api/v3/account/summary');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'error',
      message: 'Authentication required',
    });
  });

  it('returns JSON auth errors for the React admin API', async () => {
    const response = await request(createApp()).get('/api/v3/admin/summary');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'error',
      message: 'Authentication required',
    });
  });

  it.each([
    ['/', '/app/'],
    ['/advice', '/app/advice'],
    ['/services', '/app/services'],
    ['/prescriptions', '/app/prescriptions'],
    ['/vulnerabilities', '/app/vulnerabilities'],
    ['/products', '/app/products'],
    ['/products/firstaid', '/app/products?keywords=First%20Aid'],
    ['/cart', '/app/cart'],
  ])('redirects legacy browser route %s to React route %s', async (from, to) => {
    const response = await request(createApp()).get(from);

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe(to);
  });

  it('preserves the raw reflected XSS product endpoint for vulnerability demos', async () => {
    const response = await request(createApp()).get('/products?raw=true&keywords=<script>alert(1)</script>');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<script>alert(1)</script>');
  });

  it('redirects legacy login display to the React login route with query parameters', async () => {
    const response = await request(createApp()).get('/login?error=<strong>bad</strong>&redirect=/app/user/home');

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('/app/login?');
    expect(response.headers.location).toContain('error=%3Cstrong%3Ebad%3C%2Fstrong%3E');
    expect(response.headers.location).toContain('redirect=%2Fapp%2Fuser%2Fhome');
  });
});