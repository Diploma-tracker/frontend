import { atom } from '@reatom/core';

import { UserRole, type User } from '@repo/api-types';

export const NULL_USER: User = {
  id: '',
  fullName: '',
  initials: '',
  email: '',
  role: UserRole.STUDENT,
};

export const userAtom = atom<User>(NULL_USER, 'user');
