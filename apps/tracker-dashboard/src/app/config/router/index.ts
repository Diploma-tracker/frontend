import { routeTree } from '@/app/routeTree.gen';
import { authContext } from '@/modules/auth';
import { createRouter } from '@tanstack/react-router';

export interface AppRouterContext {
  auth: {
    isAuth(): boolean;
  };
}

export const router = createRouter({
  routeTree,
  context: { auth: authContext },
});
