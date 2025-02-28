import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/elasticsearch/local': {
        target: 'http://localhost:9200',
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/elasticsearch\/local/, ''),
        configure: (proxy, options) => {
          // Add any needed auth headers here
          proxy.on('proxyReq', (proxyReq, req, res) => {
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Prevent caching for this endpoint
            proxyRes.headers['cache-control'] = 'no-cache, no-store, must-revalidate';
            proxyRes.headers['pragma'] = 'no-cache';
            proxyRes.headers['expires'] = '0';
          })
        }
      }
    }
  }
});
