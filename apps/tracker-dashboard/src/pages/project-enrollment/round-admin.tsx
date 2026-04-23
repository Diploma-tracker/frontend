import { PageLayout } from '@/layouts';
import { TeachersListTable } from '@/modules/project-enrollment';
import { useParams } from '@tanstack/react-router';

export const ProjectEnrollmentRoundAdminPage = () => {
  const { roundId } = useParams({ from: '/(app)/_app/project-enrollment/$roundId' });

  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        <TeachersListTable roundId={roundId} />
      </div>
    </PageLayout>
  );
};
