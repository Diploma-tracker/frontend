import { routeTree } from '@/app/routeTree.gen';
import type { permissions } from '@/modules/auth';
import type { User } from '@/modules/user';
import { createRouter } from '@tanstack/react-router';

export interface AuthContext {
  isAuth: boolean;
  user: User;
  check: typeof permissions;
}

export interface AppRouterContext {
  auth: AuthContext;
}

export const router = createRouter({
  routeTree,
  context: { auth: undefined! },
});
