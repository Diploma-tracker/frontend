import type { User } from '@/modules/user';
import { API } from '@/shared/api/client';
import { atom, computed, effect, withCookie } from '@reatom/core';

import { UserRole } from '@repo/api-types';

export type AuthToken = string;

export const authTokenAtom = atom<AuthToken>('', 'authToken').extend(
  withCookie({
    key: 'auth_token',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    path: '/',
    secure: true,
    sameSite: 'strict',
  })
);

export const isAuth = computed(() => Boolean(authTokenAtom()), 'isAuth');

effect(() => {
  const token = authTokenAtom();
  if (token) {
    API.setToken(token);
  }
}, 'authEffect');

export const permissions = {
  isAdmin: (user: User) => user.role === UserRole.ADMIN,
  isStaff: (user: User) => user.role === UserRole.STAFF,
  isStudent: (user: User) => user.role === UserRole.STUDENT,
};
