import type { PropsWithChildren } from 'react';

import { TooltipProvider } from '@repo/ui-kit/components/common/floating/tooltip';

export const ProvidersWrapper = ({ children }: PropsWithChildren) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};
