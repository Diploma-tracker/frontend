import { MyBachelorThesesPage } from '@/pages/thesis-process';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/thesis-process/')({
  component: MyBachelorThesesPage,
});
