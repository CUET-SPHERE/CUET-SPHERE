import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Function to get the correct API URL based on mode
const getProxyTarget = () => {
  const mode = process.env.VITE_MODE || 'development';

  if (mode === 'development') {
    return process.env.VITE_LOCAL_API_URL || 'http://localhost:5454';
  } else if (mode === 'production') {
    return process.env.VITE_PRODUCTION_API_URL || 'https://cuet-sphere-service.onrender.com';
  }

  // Fallback to legacy VITE_API_URL
  return process.env.VITE_API_URL || 'http://localhost:5454';
};

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
        target: getProxyTarget(),
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: getProxyTarget(),
        changeOrigin: true,
        secure: true,
      }
    }
  }
});
