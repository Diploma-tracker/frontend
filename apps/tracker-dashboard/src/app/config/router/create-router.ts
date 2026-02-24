import { routeTree } from '@/app/routeTree.gen';
import { createRouter } from '@tanstack/react-router';

export interface AppRouterContext {
  auth: {
    isAuth(): boolean;
  };
}

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});
