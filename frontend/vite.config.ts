import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/SIH/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        timeout: 120000,
        proxyTimeout: 120000
      },
      '/ai-vision': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 120000,
        proxyTimeout: 120000
      },
      '/speech': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        timeout: 120000,
        proxyTimeout: 120000
      },
      '/health': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false
      }
    }
  },

});