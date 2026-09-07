import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const backendTarget = process.env.VITE_API_TARGET ?? 'http://localhost:8888';

export default defineConfig({
  base: '/app/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../api/public/app',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': backendTarget,
      '/uploads': backendTarget,
      '/img': backendTarget,
      '/favicon.ico': backendTarget,
      '/favicon.svg': backendTarget,
      // Legacy server-rendered form routes (full-page POSTs) must also be proxied to the backend
      '/login': backendTarget,
      '/login-mfa': backendTarget,
      '/user': backendTarget,
      '/admin': backendTarget,
      '/cart': backendTarget,
    },
  },
});
