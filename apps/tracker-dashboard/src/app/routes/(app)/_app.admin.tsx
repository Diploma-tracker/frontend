import { AdminPage } from '@/pages/admin';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/admin')({
  component: AdminPage,
});
