import { apiRequest, ApiConfigurationError, ApiError } from './api';
import type { AuthResult, User } from './types';

const mePath = process.env.NEXT_PUBLIC_AUTH_ME_PATH ?? '/me';
const loginPath = process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH ?? '/login';
const logoutPath = process.env.NEXT_PUBLIC_AUTH_LOGOUT_PATH ?? '/logout';

export async function getCurrentUser(): Promise<AuthResult> {
  if (!mePath) {
    return { status: 'unavailable', message: 'Laravel auth endpoint is not configured yet.' };
  }

  try {
    const result = await apiRequest<{ user: User }>(mePath);
    return { status: 'authenticated', user: result.user };
  } catch (error) {
    if (error instanceof ApiError && [401, 419].includes(error.status)) {
      return { status: 'unauthenticated' };
    }
    if (error instanceof ApiConfigurationError) {
      return { status: 'unavailable', message: error.message };
    }
    return { status: 'unavailable', message: 'Unable to reach the Laravel authentication service.' };
  }
}

export async function login(email: string, password: string): Promise<User> {
  if (!loginPath) {
    throw new ApiConfigurationError('Laravel login endpoint is not configured yet.');
  }

  const result = await apiRequest<{ token: string; user: User }>(loginPath, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (typeof window !== 'undefined') window.localStorage.setItem('maintenance_token', result.token);
  return result.user;
}

export async function logout(): Promise<void> {
  try { await apiRequest<void>(logoutPath, { method: 'POST' }); } finally { if (typeof window !== 'undefined') window.localStorage.removeItem('maintenance_token'); }
}
