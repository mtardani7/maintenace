import { apiRequest, ApiConfigurationError, ApiError } from './api';
import type { AuthResult, User } from './types';

const mePath = process.env.NEXT_PUBLIC_AUTH_ME_PATH;
const loginPath = process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH;
const logoutPath = process.env.NEXT_PUBLIC_AUTH_LOGOUT_PATH ?? '/api/logout';

export async function getCurrentUser(): Promise<AuthResult> {
  if (!mePath) {
    return { status: 'unavailable', message: 'Laravel auth endpoint is not configured yet.' };
  }

  try {
    const user = await apiRequest<User>(mePath);
    return { status: 'authenticated', user };
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

  return apiRequest<User>(loginPath, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await apiRequest<void>(logoutPath, { method: 'POST' });
}
