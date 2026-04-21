import { router } from '@/app/config/router';
import { action } from '@reatom/core';

import { authTokenAtom } from '../models';

export const logoutAction = action(() => {
  authTokenAtom.set('');

  router.navigate({ to: '/login' });
}, 'logoutAction');
