import { atom, computed, withCookie } from '@reatom/core';

export type AuthToken = string | null;

export interface AuthContext {
  isAuth(): boolean;
}

export const authToken = atom<AuthToken>(null, 'authToken').extend(withCookie({ key: 'auth_token' }));

export const isAuth = computed(() => {
  return Boolean(authToken());
}, 'isAuth');

export const authContext: AuthContext = {
  isAuth,
};
