import { atom } from '@reatom/core';

import { UserRole, type User } from '@repo/api-types';

// TODO: remove mock data
export const userAtom = atom<User>(
  { id: '777', email: 'john.doe@example.com', fullName: 'John Doe', initials: 'JD', role: UserRole.ADMIN },
  'user'
);
