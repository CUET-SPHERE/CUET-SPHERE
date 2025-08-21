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
        target: 'http://localhost:5454',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:5454',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
