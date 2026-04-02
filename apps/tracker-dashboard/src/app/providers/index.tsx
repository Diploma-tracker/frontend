import { UserModuleProvider } from '@/modules/user';
import { RouterProvider } from '@tanstack/react-router';

import { TooltipProvider } from '@repo/ui-kit/components/common/floating/tooltip';

import { router } from '../config/router';

export const ProvidersWrapper = () => {
  return (
    <TooltipProvider>
      <UserModuleProvider>
        <RouterProvider router={router} />
      </UserModuleProvider>
    </TooltipProvider>
  );
};
