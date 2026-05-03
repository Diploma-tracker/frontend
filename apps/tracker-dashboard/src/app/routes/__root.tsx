import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Toaster } from '@repo/ui-kit/components/common/floating/sonner';

import type { AppRouterContext } from '../config/router';

const RootLayout = () => (
  <>
    <Outlet />
    <TanStackRouterDevtools position="bottom-right" />
    <Toaster />
  </>
);

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: RootLayout,
});
