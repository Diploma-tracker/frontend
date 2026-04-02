import { atom, computed, withCookie } from '@reatom/core';

export type AuthToken = string | null;

export const authTokenAtom = atom<AuthToken>(null, 'authToken').extend(withCookie({ key: 'auth_token' }));

export const isAuth = computed(() => {
  return Boolean(authTokenAtom());
}, 'isAuth');
