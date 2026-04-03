import { authContext } from '@/modules/auth';
import { UserModuleProvider } from '@/modules/user';
import { RouterProvider } from '@tanstack/react-router';

import { TooltipProvider } from '@repo/ui-kit/components/common/floating/tooltip';

import { router } from '../config/router';
import { createProviders } from './providers-composer';

export const ProvidersWrapper = createProviders([
  TooltipProvider,
  UserModuleProvider,
  [RouterProvider, { router, context: { auth: authContext } }],
]);
