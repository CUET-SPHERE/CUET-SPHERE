// apiUtils.js
// Helper functions for the API services
import { getApiBaseUrl } from './apiConfig';

export const API_BASE_URL = import.meta.env.DEV ? '' : getApiBaseUrl();

// Helper function to get auth token
export const getAuthToken = () => {
   const user = localStorage.getItem('user');
   if (user) {
      const userData = JSON.parse(user);
      return userData.token;
   }
   return null;
};

// Helper function to handle API responses
export const handleResponse = async (response) => {
   if (!response.ok) {
      const errorData = await response.json().catch(() => ({
         message: `HTTP error! status: ${response.status}`
      }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
   }

   const data = await response.json();
   return data;
};