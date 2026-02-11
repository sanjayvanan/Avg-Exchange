// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with '/api' will be proxied to CoinGecko
      '/api': {
        target: 'https://api.coingecko.org/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Removes '/api' from the actual URL
      },
    },
  },
});