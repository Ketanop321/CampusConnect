// Base API URL - update this to match your backend URL
// Load environment variables with fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Add other configuration variables here as needed
export default {
  API_BASE_URL,
};
