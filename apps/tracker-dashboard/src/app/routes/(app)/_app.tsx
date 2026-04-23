import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuth) {
      throw redirect({ to: '/login', replace: true });
    }
    return { role: context.auth.user.role };
  },
});
