import { action, withAsync, wrap } from '@reatom/core';

import type { LoginRequest } from '@repo/api-types';

import { authTokenAtom } from '.';
import { fetchLogin } from '../api';

export const loginAction = action(async (dto: LoginRequest) => {
  const response = await wrap(fetchLogin(dto));

  if (!response.ok) {
    throw new Error(response.error?.message || 'Ошибка авторизации');
  }

  const { access_token } = response.data;

  authTokenAtom.set(access_token);
}, 'loginAction').extend(withAsync());
