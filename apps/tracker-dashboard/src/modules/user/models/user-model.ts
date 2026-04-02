import { atom } from '@reatom/core';

import { UserRole, type User } from '@repo/api-types';

export const userAtom = atom<User>(
  { id: '777', email: 'john.doe@example.com', fullName: 'John Doe', initials: 'JD', role: UserRole.Admin },
  'user'
);
