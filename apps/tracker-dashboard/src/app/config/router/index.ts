import { routeTree } from '@/app/routeTree.gen';
import { createRouter } from '@tanstack/react-router';

import type { UserRole } from '@repo/api-types';

export interface AuthContext {
  isAuth: boolean;
  userRole: UserRole | null;
}

export interface AppRouterContext {
  auth: AuthContext;
}

export const router = createRouter({
  routeTree,
  context: { auth: undefined! },
});
