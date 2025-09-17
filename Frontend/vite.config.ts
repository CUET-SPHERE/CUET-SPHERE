import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this to handle PDF and DOCX files as assets
  assetsInclude: ['**/*.pdf', '**/*.docx'],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://cuet-sphere-service.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: process.env.VITE_API_URL || 'https://cuet-sphere-service.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
});
