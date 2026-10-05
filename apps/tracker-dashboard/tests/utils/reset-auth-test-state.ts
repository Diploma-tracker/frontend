import { authTokenAtom } from '@/modules/auth';
import { loginForm } from '@/modules/auth';

import { API } from '@repo/api';

const AUTH_COOKIE_NAME = 'auth_token';

export function resetAuthTestState() {
  loginForm.reset();

  authTokenAtom.set('');

  API.removeToken();

  document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; Path=/`;
}
