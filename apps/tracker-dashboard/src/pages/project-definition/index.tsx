import { PageLayout } from '@/layouts';
import { ProjectDefinitionEditor } from '@/modules/project-definition';

export const ProjectDefinitionEditorPage =
  function ProjectDefinitionEditorPage() {
    return (
      <PageLayout>
        <ProjectDefinitionEditor />
      </PageLayout>
    );
  };
