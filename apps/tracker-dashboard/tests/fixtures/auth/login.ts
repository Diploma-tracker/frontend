import type { LoginRequest } from '@repo/api/model';

export const validLoginCredentials = {
  credential: 'student@cs.khpi.edu.ua',
  password: 'test-password',
} satisfies LoginRequest;

export type LoginHttpResponse = {
  access_token: string;
};

export type BackendErrorHttpResponse = {
  status_code: number;
  detail: string;
  extra: Record<string, unknown>;
};

export function createLoginCredentials(
  overrides: Partial<LoginRequest> = {},
): LoginRequest {
  return {
    ...validLoginCredentials,
    ...overrides,
  };
}

export function createLoginHttpResponse(
  overrides: Partial<LoginHttpResponse> = {},
): LoginHttpResponse {
  return {
    access_token: 'login-test-token',
    ...overrides,
  };
}

export function createBackendErrorHttpResponse(
  overrides: Partial<BackendErrorHttpResponse> = {},
): BackendErrorHttpResponse {
  return {
    status_code: 401,
    detail: 'Invalid credentials',
    extra: {},
    ...overrides,
  };
}
