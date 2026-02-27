// Environment configuration
// Vite requires VITE_ prefix for environment variables to be exposed to the client

export const env = {
  // API Base URL
  // In development: uses mock data (set apiUrl empty)
  // In production: uses hosted API
  // Override with VITE_API_URL env var to use real API in development
  apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://admin-area-be.onrender.com'),
  
  // API Timeout in milliseconds
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  
  // Environment mode
  mode: import.meta.env.MODE || 'development',
  
  // Whether we're in production
  isProduction: import.meta.env.PROD,
  
  // Whether we're in development
  isDevelopment: import.meta.env.DEV,
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  if (!env.apiUrl) {
    // If no API URL is set, return empty string for relative URLs or mock data
    return '';
  }
  
  // Remove trailing slash from base URL and leading slash from endpoint
  let baseUrl = env.apiUrl.replace(/\/$/, '');
  // if the configured URL doesn't already include '/api', add it
  if (!baseUrl.endsWith('/api')) {
    baseUrl = `${baseUrl}/api`;
  }
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${path}`;
};

// Helper function to check if we should use mock data
// Returns true only if no API URL is configured
export const shouldUseMockData = (): boolean => {
  return !env.apiUrl;
};

