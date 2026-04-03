import { isAuth } from '../models/auth-model';

export const authContext = {
  isAuth: isAuth(),
  userRole: null,
};
