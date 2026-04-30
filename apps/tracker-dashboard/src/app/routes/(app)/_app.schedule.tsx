import { SchedulePage } from '@/pages/schedule';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/schedule')({
  component: SchedulePage,
});
