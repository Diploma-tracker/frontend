import { PageLayout } from '@/layouts';
import { ProjectDefinitionEditor } from '@/modules/project-definition';

export const ProjectDefinitionPage = function ProjectDefinitionPage() {
  return (
    <PageLayout>
      <ProjectDefinitionEditor />
    </PageLayout>
  );
};
