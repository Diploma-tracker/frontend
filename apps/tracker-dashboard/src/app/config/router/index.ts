import { routeTree } from '@/app/routeTree.gen';
import type { User } from '@/modules/user';
import { createRouter } from '@tanstack/react-router';

export interface AuthContext {
  isAuth: boolean;
  user: User;
}

export interface AppRouterContext {
  auth: AuthContext;
}

export const router = createRouter({
  routeTree,
  context: { auth: undefined! },
});
