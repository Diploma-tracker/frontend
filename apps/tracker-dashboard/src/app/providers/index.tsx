import { authContext } from '@/modules/auth';
import { UserModuleProvider } from '@/modules/user';
import { RouterProvider } from '@tanstack/react-router';

import { TooltipProvider } from '@repo/ui-kit/components/common/floating/tooltip';

import { router } from '../config/router';
import { createProviders } from './providers-composer';

const routerProviderProps: Parameters<typeof RouterProvider>[0] = {
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
