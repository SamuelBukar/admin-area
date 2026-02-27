import { ApiError } from '@/lib/apiClient';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Extract the most precise user-facing error message from backend responses.
 *
 * Backend shape example:
 * { ok: false, data: null, message: "Email already in use", code: "UNPROCESSABLE_ENTITY" }
 */
export function getPreciseErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) {
    const resp = error.response;
    if (isRecord(resp) && typeof resp.message === 'string' && resp.message.trim()) {
      return resp.message.trim();
    }
    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message.trim();
    }
    return null;
  }

  if (error instanceof Error && typeof error.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }

  if (isRecord(error) && typeof error.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }

  return null;
}

