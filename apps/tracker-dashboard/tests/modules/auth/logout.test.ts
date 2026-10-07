import { authTokenAtom, loginAction, logoutAction } from '@/modules/auth';
import { waitFor } from '@testing-library/react';
import { createLoginCredentials } from '@tests/fixtures/auth/login';
import { createLoginSuccessHandler } from '@tests/mocks/api/auth/login';
import { createLogoutSessionCheckHandler } from '@tests/mocks/api/auth/logout';
import { server } from '@tests/setup/msw/server';
import { resetAuthTestState } from '@tests/utils/reset-auth-test-state';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { API } from '@repo/api';

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock('@/app/config/router', () => ({
  router: {
    navigate: navigateMock,
  },
}));

describe('logout', () => {
  beforeEach(() => {
    resetAuthTestState();
  });

  afterEach(() => {
    resetAuthTestState();
  });

  it('clears authentication, navigates to login, and stops authorizing requests', async () => {
    const authorizationHeaders: (string | null)[] = [];

    server.use(
      createLoginSuccessHandler({ token: 'logout-test-token' }),
      createLogoutSessionCheckHandler((authorization) => {
        authorizationHeaders.push(authorization);
      }),
    );

    await loginAction(createLoginCredentials());

    expect(authTokenAtom()).toBe('logout-test-token');
    expect(
      (await API.request('/logout-session-check', { method: 'GET' })).ok,
    ).toBe(true);
    expect(authorizationHeaders).toEqual(['Bearer logout-test-token']);

    logoutAction();

    expect(authTokenAtom()).toBe('');
    expect(navigateMock).toHaveBeenCalledWith({ to: '/login' });
    await waitFor(async () => {
      expect(
        (await API.request('/logout-session-check', { method: 'GET' })).ok,
      ).toBe(true);
      expect(authorizationHeaders.at(-1)).toBeNull();
    });
  });
});
