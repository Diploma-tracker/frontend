import { RouterProvider } from '@tanstack/react-router';

import { router, type AppRouterContext } from './create-router';

interface AppRouterProviderProps {
  context: AppRouterContext;
}

export const AppRouterProvider = ({ context }: AppRouterProviderProps) => {
  return <RouterProvider router={router} context={context} />;
};
