# Environment Configuration

This project uses environment variables to configure the API URL and other settings.

## Setup

1. **Copy the example environment file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` and set your configuration:**
   ```env
   # For production API
   VITE_API_URL=https://api.yourdomain.com
   
   # Or for local development API
   VITE_API_URL=http://localhost:3000/api
   
   # API timeout (optional, default: 30000ms)
   VITE_API_TIMEOUT=30000
   ```

3. **Restart your development server** after making changes to `.env`

## Environment Variables

### `VITE_API_URL`
- **Description:** Base URL for your API
- **Default:** Empty (uses mock data)
- **Example:** `https://api.yourdomain.com` or `http://localhost:3000/api`
- **Note:** Must start with `VITE_` prefix to be exposed to the client in Vite

### `VITE_API_TIMEOUT`
- **Description:** Request timeout in milliseconds
- **Default:** `30000` (30 seconds)
- **Optional:** Only set if you need a custom timeout

## Usage in Code

The environment configuration is available through the `env` config:

```typescript
import { env, getApiUrl } from '@/config/env';

// Get API base URL
const apiUrl = env.apiUrl;

// Get full URL for an endpoint
const fullUrl = getApiUrl('/users');

// Check if using mock data
const useMock = shouldUseMockData();
```

## API Client

Use the API client utilities for making HTTP requests:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';

// GET request
const users = await apiGet('/users');

// POST request
const newUser = await apiPost('/users', { name: 'John', email: 'john@example.com' });

// PUT request
const updated = await apiPut('/users/123', { name: 'Jane' });

// DELETE request
await apiDelete('/users/123');
```

## Production Deployment

When deploying to production:

1. Set `VITE_API_URL` in your hosting platform's environment variables
2. For Vercel: Add it in Project Settings → Environment Variables
3. For Netlify: Add it in Site Settings → Environment Variables
4. For Docker: Pass it as an environment variable
5. For other platforms: Follow their documentation for setting environment variables

**Important:** Never commit your `.env` file to version control. It's already in `.gitignore`.

## Development vs Production

- **Development (no VITE_API_URL):** Uses mock data with simulated delays
- **Production (with VITE_API_URL):** Makes real API calls to the configured URL

