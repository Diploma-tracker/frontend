import { atom, computed, withCookie } from '@reatom/core';

import { DomainRole, SystemRole } from '@repo/api-types';

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

export const permissions = {
  // System levels
  isAdmin: (sRole: SystemRole) => sRole === SystemRole.ADMIN || sRole === SystemRole.SUPER_ADMIN,

  // Domain levels
  isStaff: (dRole: DomainRole) => dRole === DomainRole.STAFF,
  isStudent: (dRole: DomainRole) => dRole === DomainRole.STUDENT,
};
