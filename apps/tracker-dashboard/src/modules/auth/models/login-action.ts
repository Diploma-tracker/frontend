import { action, withAsync, wrap } from '@reatom/core';

import { login } from '@repo/api/auth';
import type { LoginRequest } from '@repo/api/model';

import { authTokenAtom } from '.';

export const loginAction = action(async (dto: LoginRequest) => {
  const response = await wrap(login(dto));

  if (!response.ok) {
    throw new Error(response.error?.message || 'Ошибка авторизации');
  }

  const { accessToken } = response.data;

  authTokenAtom.set(accessToken);
}, 'loginAction').extend(withAsync());
