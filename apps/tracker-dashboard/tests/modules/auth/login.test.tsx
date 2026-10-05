import { LoginForm, authTokenAtom } from '@/modules/auth';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createLoginCredentials,
  validLoginCredentials,
} from '@tests/fixtures/auth/login';
import {
  createLoginRejectedHandler,
  createLoginSuccessHandler,
} from '@tests/mocks/api/auth/login';
import { server } from '@tests/setup/msw/server';
import { resetAuthTestState } from '@tests/utils/reset-auth-test-state';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('@/app/config/router', () => ({
  router: {
    navigate: navigateMock,
  },
}));

vi.mock('@repo/ui-kit/components/common/floating/sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

async function fillCredentials(
  user: ReturnType<typeof userEvent.setup>,
  credentials = validLoginCredentials,
) {
  await user.type(
    screen.getByRole('textbox', {
      name: 'Email',
    }),
    credentials.credential,
  );

  await user.type(screen.getByLabelText('Password'), credentials.password);
}

describe('login', () => {
  beforeEach(() => {
    resetAuthTestState();
  });

  afterEach(() => {
    resetAuthTestState();
  });

  it('sends credentials, authenticates, and navigates home after a successful login', async () => {
    const credentials = createLoginCredentials();

    let requestBody: unknown;

    server.use(
      createLoginSuccessHandler({
        token: 'login-test-token',
        onRequest: (body) => {
          requestBody = body;
        },
      }),
    );

    const user = userEvent.setup();

    render(<LoginForm />);

    await fillCredentials(user, credentials);

    await user.click(
      screen.getByRole('button', {
        name: 'Login',
      }),
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/',
      });

      expect(toastSuccessMock).toHaveBeenCalledWith(
        'You have successfully logged in!',
      );
    });

    expect(requestBody).toEqual(credentials);

    expect(authTokenAtom()).toBe('login-test-token');

    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it('does not authenticate when credentials are rejected', async () => {
    server.use(
      createLoginRejectedHandler({
        status: 401,
        detail: 'Invalid credentials',
      }),
    );

    const user = userEvent.setup();

    render(<LoginForm />);

    await fillCredentials(user);

    await user.click(
      screen.getByRole('button', {
        name: 'Login',
      }),
    );

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        'An error occurred during login. Please try again.',
      );
    });

    expect(authTokenAtom()).toBe('');

    expect(navigateMock).not.toHaveBeenCalled();

    expect(toastSuccessMock).not.toHaveBeenCalled();

    expect(
      screen.getByRole('button', {
        name: 'Login',
      }),
    ).toBeEnabled();
  });

  it('allows retrying after rejected credentials', async () => {
    server.use(
      createLoginRejectedHandler({
        status: 401,
        detail: 'Invalid credentials',
        once: true,
      }),
      createLoginSuccessHandler({
        token: 'retry-test-token',
      }),
    );

    const user = userEvent.setup();

    render(<LoginForm />);

    await fillCredentials(user);

    const submitButton = screen.getByRole('button', {
      name: 'Login',
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/',
      });

      expect(toastSuccessMock).toHaveBeenCalledWith(
        'You have successfully logged in!',
      );
    });

    expect(authTokenAtom()).toBe('retry-test-token');
  });

  it.each([
    {
      name: 'invalid email',
      email: 'invalid-email',
      password: validLoginCredentials.password,
      field: 'Email',
      error: 'This is an invalid email address!',
    },
    {
      name: 'empty password',
      email: validLoginCredentials.credential,
      password: '',
      field: 'Password',
      error: 'This field is required!',
    },
  ])(
    'shows validation for $name without sending a login request',
    async ({ email, password, field, error }) => {
      const requestReceived = vi.fn();

      server.use(
        createLoginSuccessHandler({
          onRequest: requestReceived,
        }),
      );

      const user = userEvent.setup();

      render(<LoginForm />);

      await user.type(
        screen.getByRole('textbox', {
          name: 'Email',
        }),
        email,
      );

      if (password) {
        await user.type(screen.getByLabelText('Password'), password);
      }

      await user.click(
        screen.getByRole('button', {
          name: 'Login',
        }),
      );

      expect(await screen.findByText(error)).toBeVisible();

      expect(screen.getByLabelText(field)).toHaveAttribute(
        'aria-invalid',
        'true',
      );

      expect(requestReceived).not.toHaveBeenCalled();

      expect(authTokenAtom()).toBe('');

      expect(navigateMock).not.toHaveBeenCalled();

      expect(toastSuccessMock).not.toHaveBeenCalled();

      expect(toastErrorMock).not.toHaveBeenCalled();
    },
  );
});
