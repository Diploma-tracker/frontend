import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/project-enrollment')({
  component: Outlet,
});
