import { ProjectDefinitionEditorPage } from '@/pages/project-definition';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/project-definition')({
  component: ProjectDefinitionEditorPage,
});
