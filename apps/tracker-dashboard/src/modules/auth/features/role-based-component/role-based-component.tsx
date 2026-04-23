import type { ComponentType } from 'react';

import { userAtom } from '@/modules/user';
import { reatomComponent } from '@reatom/react';

import { UserRole } from '@repo/api-types';

type RoleComponents = {
  admin?: ComponentType;
  staff?: ComponentType;
  student?: ComponentType;
  default?: ComponentType;
};

const roleKeyMap: Record<string, UserRole> = {
  admin: UserRole.ADMIN,
  staff: UserRole.STAFF,
  student: UserRole.STUDENT,
};

export function roleBasedComponent(roleComponents: RoleComponents) {
  return reatomComponent(function RoleBasedComponent() {
    const { role } = userAtom();
    const key = Object.entries(roleKeyMap).find(([, v]) => v === role)?.[0] as keyof RoleComponents | undefined;
    const Component = (key ? roleComponents[key] : undefined) ?? roleComponents.default;

    if (!Component) {
      return null;
    }

    return <Component />;
  }, 'RoleBasedComponent');
}
