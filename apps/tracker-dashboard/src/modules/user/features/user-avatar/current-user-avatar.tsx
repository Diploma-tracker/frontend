import { reatomComponent } from '@reatom/react';

import { userAtom } from '../../models';
import { UserAvatar } from './user-avatar';

export const CurrentUserAvatar = reatomComponent(function CurrentUserAvatar() {
  const { id } = userAtom();
  return <UserAvatar userId={id} />;
});
