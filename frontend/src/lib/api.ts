import type { ApiErrorPayload } from './types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
const csrfCookiePath = process.env.NEXT_PUBLIC_CSRF_COOKIE_PATH ?? '/api/csrf-cookie';

function readCookie(name: string) {
  if (typeof document === 'undefined') return '';
  const entry = document.cookie.split('; ').find((item) => item.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : '';
}

async function ensureCsrfToken() {
  if (typeof document === 'undefined') return '';
  const existing = readCookie('XSRF-TOKEN');
  if (existing) return existing;
  const response = await fetch(`${apiBaseUrl}${csrfCookiePath}`, { credentials: 'include', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new ApiError('The CSRF token could not be initialized.', response.status);
  return readCookie('XSRF-TOKEN');
}

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export class ApiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiConfigurationError';
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiConfigurationError('NEXT_PUBLIC_API_URL is not configured.');
  }

  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const method = (init?.method ?? 'GET').toUpperCase();
  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const csrfToken = isMutating && path !== csrfCookiePath ? await ensureCsrfToken() : '';
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
      ...(init?.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | undefined;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = undefined;
    }
    throw new ApiError(payload?.message ?? 'The API request could not be completed.', response.status, payload);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function apiDownload(path: string, init?: RequestInit): Promise<Blob> {
  if (!apiBaseUrl) {
    throw new ApiConfigurationError('NEXT_PUBLIC_API_URL is not configured.');
  }
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: { Accept: 'text/csv, application/octet-stream', ...init?.headers },
  });
  if (!response.ok) throw new ApiError('The API download could not be completed.', response.status);
  return response.blob();
}
