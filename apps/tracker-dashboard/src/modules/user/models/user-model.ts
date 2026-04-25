import { authTokenAtom, decodeAuthToken } from '@/modules/auth';
import { computed } from '@reatom/core';

import { UserRole } from '@repo/api/types';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: UserRole;
  avatarUrl?: string;
};

const NULL_USER: User = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  role: UserRole.STUDENT,
  isActive: false,
};

export const userAtom = computed<User>(() => {
  const token = authTokenAtom();

  if (!token) {
    return NULL_USER;
  }

  const payload = decodeAuthToken(token);

  if (!payload) {
    return NULL_USER;
  }

  return {
    id: payload.user_id,
    firstName: payload.first_name,
    lastName: payload.last_name,
    email: payload.email,
    role: payload.role,
    isActive: payload.is_active,
  };
});
