// Shared API URL utility - ensures all services use consistent API configuration

/**
 * Smart API URL selection based on mode
 * This function is used across all service files to ensure consistency
 */
export const getApiBaseUrl = () => {
   const mode = import.meta.env.VITE_MODE || 'development';

   if (mode === 'development') {
      return import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5454';
   } else if (mode === 'production') {
      return import.meta.env.VITE_PRODUCTION_API_URL || 'https://cuet-sphere-service.onrender.com';
   }

   // Fallback to legacy VITE_API_URL if mode is not set properly
   return import.meta.env.VITE_API_URL || 'http://localhost:5454';
};

/**
 * Get API base URL with /api suffix for services that need it
 */
export const getApiUrlWithSuffix = () => {
   return `${getApiBaseUrl()}/api`;
};

// Export the current API base URL for backward compatibility
export const API_BASE_URL = getApiBaseUrl();

// Log configuration for debugging
console.log('🔧 Shared API Configuration:');
console.log('  Mode:', import.meta.env.VITE_MODE || 'development');
console.log('  API Base URL:', API_BASE_URL);