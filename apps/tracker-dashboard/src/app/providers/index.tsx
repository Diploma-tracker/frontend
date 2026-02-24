import { authContext } from '@/modules/auth';

import { TooltipProvider } from '@repo/ui-kit/components/common/floating/tooltip';

import { AppRouterProvider } from '../config/router';

export const ProvidersWrapper = () => {
  return (
    <TooltipProvider>
      <AppRouterProvider context={{ auth: authContext }} />
    </TooltipProvider>
  );
};
