// API Client utility for making HTTP requests
// Uses environment variables for base URL configuration

import { getApiUrl, env } from '@/config/env';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an API request
 * @param endpoint - API endpoint (e.g., '/users' or 'users')
 * @param options - Request options
 * @returns Promise with response data
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = env.apiTimeout,
  } = options;

  const url =
    endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : getApiUrl(endpoint);

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authentication token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      // Many APIs wrap their real payload inside a `data` property. To make
      // the client easier to consume we unwrap it automatically here so callers
      // don't have to repeat the same logic everywhere.
      if (json && typeof json === 'object' && 'data' in json) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (json as any).data;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return json as any;
    }

    return await response.text() as any;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      error
    );
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * PUT request helper
 */
export async function apiPut<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'PATCH', body });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}

