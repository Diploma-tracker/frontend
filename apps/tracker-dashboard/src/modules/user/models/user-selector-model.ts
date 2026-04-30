import { action, withAsync, wrap } from '@reatom/core';

import { listUsers } from '@repo/api/iam';
import type { LoginTokenUserRole, RoleFilter } from '@repo/api/model';

export interface UserOption {
  value: string;
  label: string;
}

const SHOWN_USERS = 5;

export const loadUserOptions = action(async (query: string, role?: LoginTokenUserRole): Promise<UserOption[]> => {
  const roleFilterByRole: Record<LoginTokenUserRole, RoleFilter> = {
    admin: 'ADMIN',
    staff: 'STAFF',
    student: 'STUDENT',
  };
  const roleFilter = role ? roleFilterByRole[role] : undefined;

  const result = await wrap(
    listUsers({
      page: 1,
      pageSize: SHOWN_USERS,
      roleFilter,
      search: query,
    })
  );

  if (!result.ok) {
    return [];
  }

  return result.data.items.map((u) => ({
    value: u.id,
    label: u.firstName + ' ' + u.lastName,
  }));
}, 'loadUserOptions').extend(withAsync());
