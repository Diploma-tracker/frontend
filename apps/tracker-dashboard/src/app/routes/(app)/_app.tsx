import { createFileRoute, redirect } from '@tanstack/react-router';

import { UserRole } from '@repo/api-types';

export const Route = createFileRoute('/(app)/_app')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuth) {
      throw redirect({ to: '/login', replace: true });
    }

    const pathname = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '');
    const { role } = context.auth.user;

    if (role === UserRole.ADMIN) {
      if (pathname !== '/admin' && !pathname.startsWith('/admin/')) {
        throw redirect({ to: '/admin', replace: true });
      }

      return;
    }

    if (role === UserRole.STAFF) {
      if (pathname !== '/staff' && !pathname.startsWith('/staff/')) {
        throw redirect({ to: '/staff', replace: true });
      }

      return;
    }

    if (pathname !== '/student' && !pathname.startsWith('/student/')) {
      throw redirect({ to: '/student', replace: true });
    }
  },
});
