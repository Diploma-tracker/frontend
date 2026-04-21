import { userAtom } from '@/modules/user';

import { isAuth, permissions } from '../models/auth-model';

export const authContext = {
  get isAuth() {
    return isAuth();
  },
  get user() {
    return userAtom();
  },
  check: permissions,
};
