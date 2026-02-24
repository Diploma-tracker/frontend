import { HomePage } from '@/pages/home';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuth()) {
      throw redirect({ to: '/login' });
    }
  },
});
