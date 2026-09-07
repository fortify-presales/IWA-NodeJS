import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.VITE_API_TARGET ?? 'http://localhost:8888';

export default defineConfig({
  base: '/app/',
  plugins: [react()],
  build: {
    outDir: '../api/public/app',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': backendTarget,
      '/uploads': backendTarget,
      // Legacy server-rendered form routes (full-page POSTs) must also be proxied to the backend
      '/login': backendTarget,
      '/login-mfa': backendTarget,
      '/user': backendTarget,
      '/admin': backendTarget,
      '/cart': backendTarget,
    },
  },
});