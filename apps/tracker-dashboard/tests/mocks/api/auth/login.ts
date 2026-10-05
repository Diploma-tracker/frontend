import {
  createBackendErrorHttpResponse,
  createLoginHttpResponse,
} from '@tests/fixtures/auth/login';
import { HttpResponse, type RequestHandler, http } from 'msw';

const LOGIN_URL = '*/auth/login';

type LoginSuccessHandlerOptions = {
  token?: string;
  once?: boolean;
  onRequest?: (body: unknown) => void;
};

type LoginRejectedHandlerOptions = {
  status?: number;
  detail?: string;
  extra?: Record<string, unknown>;
  once?: boolean;
};

export function createLoginSuccessHandler(
  options: LoginSuccessHandlerOptions = {},
): RequestHandler {
  const { token = 'login-test-token', once = false, onRequest } = options;

  return http.post(
    LOGIN_URL,
    async ({ request }) => {
      const body = await request.json();

      onRequest?.(body);

      return HttpResponse.json(
        createLoginHttpResponse({
          access_token: token,
        }),
      );
    },
    {
      once,
    },
  );
}

export function createLoginRejectedHandler(
  options: LoginRejectedHandlerOptions = {},
): RequestHandler {
  const {
    status = 401,
    detail = 'Invalid credentials',
    extra = {},
    once = false,
  } = options;

  return http.post(
    LOGIN_URL,
    () =>
      HttpResponse.json(
        createBackendErrorHttpResponse({
          status_code: status,
          detail,
          extra,
        }),
        {
          status,
        },
      ),
    {
      once,
    },
  );
}
