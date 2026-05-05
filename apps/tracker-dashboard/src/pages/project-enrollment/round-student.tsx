import { PageLayout } from '@/layouts';
import { StudentTeachersListTable } from '@/modules/project-enrollment';
import { useTranslation } from '@/shared/utils/i18n';
import { useParams } from '@tanstack/react-router';

export const ProjectEnrollmentRoundStudentPage = () => {
  const { t } = useTranslation();

  const { roundId } = useParams({
    from: '/(app)/_app/project-enrollment/$roundId',
  });

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 border-b pb-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('projectEnrollment.pages.student.title')}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            {t('projectEnrollment.pages.student.description')}
          </p>
        </div>

        <StudentTeachersListTable roundId={roundId} />
      </div>
    </PageLayout>
  );
};
