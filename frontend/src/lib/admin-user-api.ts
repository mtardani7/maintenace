import { apiRequest, ApiConfigurationError, ApiError } from './api';
import type { Role, User } from './types';

const createUserPath = process.env.NEXT_PUBLIC_ADMIN_USERS_PATH ?? '/api/admin/users';

export type CreateUserInput = {
  name: string;
  email: string;
  role: Role;
  password: string;
  password_confirmation: string;
};

export function createUser(input: CreateUserInput) {
  return apiRequest<User>(createUserPath, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function adminUserApiMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session has expired. Sign in again.';
    if (error.status === 403) return 'Only Admin users can create accounts.';
    if (error.status === 422) return error.message || 'Check the account details and try again.';
    if (error.status >= 500) return 'The account service is unavailable. Try again shortly.';
  }
  if (error instanceof ApiConfigurationError) return error.message;
  if (error instanceof TypeError) return 'The account service could not be reached.';
  return 'The account could not be created.';
}
