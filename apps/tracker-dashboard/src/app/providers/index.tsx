import { authContext } from '@/modules/auth';
import { UserModuleProvider } from '@/modules/user';
import { RouterProvider } from '@tanstack/react-router';

import { TooltipProvider } from '@repo/ui-kit/components/common/floating/tooltip';

import type { AppRouterContext } from '../config/router';
import { router } from '../config/router';
import { createProviders } from './providers-composer';

type RouterProviderProps = Omit<
  Parameters<typeof RouterProvider>[0],
  'context'
> & {
  context: AppRouterContext;
};

const routerProviderProps: RouterProviderProps = {
  router,
  context: {
    auth: authContext,
  },
};

export const ProvidersWrapper = createProviders([
  TooltipProvider,
  UserModuleProvider,
  [RouterProvider, routerProviderProps],
]);
