import { authTokenAtom, decodeAuthToken } from '@/modules/auth';
import { computed } from '@reatom/core';

import { DomainRole, SystemRole } from '@repo/api-types';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  systemRole: SystemRole;
  domainRole: DomainRole;
  avatarUrl?: string;
};

const NULL_USER: User = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  systemRole: SystemRole.USER,
  domainRole: DomainRole.STUDENT,
  isActive: false,
};

export const userAtom = computed(() => {
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
    systemRole: payload.system_role,
    domainRole: payload.domain_role,
    isActive: payload.is_active,
  };
});
