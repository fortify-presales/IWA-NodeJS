import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8890',
    browserName: 'chromium',
    channel: 'msedge',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && node dist/index.js',
    url: 'http://127.0.0.1:8890/api/v3/site/status',
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      NODE_ENV: 'test',
      PORT: '8890',
      DATABASE_URL: './data/e2e.sqlite',
    },
  },
});