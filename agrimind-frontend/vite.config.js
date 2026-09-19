import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backend = {
  target: 'http://localhost:3000',
  changeOrigin: true,
  secure: false
};

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': backend,
      '/login': backend,
      '/signup': backend,
      '/logout': backend,
      '/profile': backend,
      '/recommendation': backend,
      '/uploads': backend,
      '/images': backend
    }
  }
});