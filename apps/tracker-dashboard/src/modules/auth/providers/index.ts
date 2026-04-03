import type { Computed } from '@reatom/core';

import type { UserRole } from '@repo/api-types';

import { isAuth } from '../models/auth-model';

export interface AuthContext {
  isAuth: Computed<boolean>;
  userRole: UserRole | null;
}

export const authContext: AuthContext = {
  isAuth,
  userRole: null,
};
