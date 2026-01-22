/**
 * API Configuration
 * Configure your Django REST Framework backend URL here
 */

export const API_CONFIG = {
  // Base URL for your Django backend
  // Change this to your actual DRF backend URL
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  
  // API timeout in milliseconds
  timeout: 10000,
  
  // Default headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Get the full API URL for an endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.baseURL}/${cleanEndpoint}`;
};


