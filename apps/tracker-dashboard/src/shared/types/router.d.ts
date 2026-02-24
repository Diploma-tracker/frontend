import type { router } from '@/app/config/router/create-router';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export {};
