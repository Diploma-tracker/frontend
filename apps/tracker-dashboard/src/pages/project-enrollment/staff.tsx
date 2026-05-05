import { PageLayout } from '@/layouts';
import {
  AllocationRoundsFilters,
  AllocationRoundsPagination,
  AllocationsListTable,
} from '@/modules/project-enrollment';
import { useTranslation } from '@/shared/utils/i18n';

export const ProjectEnrollmentStaffPage = () => {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 border-b pb-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('projectEnrollment.listPages.staff.title')}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            {t('projectEnrollment.listPages.staff.description')}
          </p>
        </div>

        <AllocationRoundsFilters />
        <AllocationsListTable />
        <AllocationRoundsPagination />
      </div>
    </PageLayout>
  );
};
