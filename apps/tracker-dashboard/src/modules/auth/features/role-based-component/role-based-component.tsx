import type { ComponentType } from 'react';

import { userAtom } from '@/modules/user';
import { reatomComponent } from '@reatom/react';

import { UserRole } from '@repo/api/types';

type RoleComponents = {
  admin?: ComponentType;
  staff?: ComponentType;
  student?: ComponentType;
  default?: ComponentType;
};

const roleToKey: Partial<Record<UserRole, keyof RoleComponents>> = {
  [UserRole.ADMIN]: 'admin',
  [UserRole.STAFF]: 'staff',
  [UserRole.STUDENT]: 'student',
};

export function roleBasedComponent(roleComponents: RoleComponents) {
  return reatomComponent(function RoleBasedComponent() {
    const { role } = userAtom();
    const key = roleToKey[role];
    const Component =
      (key ? roleComponents[key] : undefined) ?? roleComponents.default;

    if (!Component) {
      return null;
    }

    return <Component />;
  }, 'RoleBasedComponent');
}
