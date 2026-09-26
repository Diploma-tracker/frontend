import { FormBuilderPage } from '@/pages/form-builder';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/form-builder')({
  component: FormBuilderPage,
});
