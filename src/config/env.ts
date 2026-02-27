// Environment configuration
// Vite requires VITE_ prefix for environment variables to be exposed to the client

export const env = {
  // API Base URL
  // Override with VITE_API_URL env var; otherwise use hosted API
  apiUrl: import.meta.env.VITE_API_URL || 'https://admin-area-be.onrender.com',
  
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
  if (!env.apiUrl) throw new Error('VITE_API_URL is not configured');
  
  // Remove trailing slash from base URL and leading slash from endpoint
  let baseUrl = env.apiUrl.replace(/\/$/, '');
  // if the configured URL doesn't already include '/api', add it
  if (!baseUrl.endsWith('/api')) {
    baseUrl = `${baseUrl}/api`;
  }
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${path}`;
};

/**
 * Base backend URL without the `/api` suffix.
 * Useful for calling non-API endpoints like `/` and `/health`.
 */
export const getBaseUrl = (): string => {
  if (!env.apiUrl) throw new Error('VITE_API_URL is not configured');
  const base = env.apiUrl.replace(/\/$/, '');
  return base.endsWith('/api') ? base.slice(0, -'/api'.length) : base;
};

