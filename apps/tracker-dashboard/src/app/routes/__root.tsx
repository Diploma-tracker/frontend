import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import type { AppRouterContext } from '../config/router';

const RootLayout = () => (
  <>
    <Outlet />
    <TanStackRouterDevtools position="bottom-right" />
  </>
);

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: RootLayout,
});
