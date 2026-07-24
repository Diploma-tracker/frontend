import { PageLayout } from '@/layouts';
import {
  AdminTeachersListTable,
  BachelorThesesListTable,
} from '@/modules/project-enrollment';
import { useTranslation } from '@/shared/utils/i18n';
import { useParams } from '@tanstack/react-router';

export const ProjectEnrollmentRoundAdminPage = () => {
  const { t } = useTranslation();

  const { roundId } = useParams({
    from: '/(app)/_app/project-enrollment/$roundId',
  });

  return (
    <PageLayout>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-1.5 border-b pb-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('projectEnrollment.pages.admin.title')}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            {t('projectEnrollment.pages.admin.description')}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <AdminTeachersListTable roundId={roundId} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b pb-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {t('projectEnrollment.bachelorTheses.section.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('projectEnrollment.bachelorTheses.section.description')}
            </p>
          </div>

          <BachelorThesesListTable roundId={roundId} />
        </div>
      </div>
    </PageLayout>
  );
};
