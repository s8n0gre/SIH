import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/SIH/',
  plugins: [react()],
  server: {
    port: 3000,
    host: true,  // bind to 0.0.0.0 so LAN users can connect
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false
      },
      '/ai-vision': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false
      },
      '/speech': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false
      }
    }
  },

});