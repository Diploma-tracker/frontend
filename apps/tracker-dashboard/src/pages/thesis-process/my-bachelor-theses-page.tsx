import { PageLayout } from '@/layouts';
import { MyBachelorThesesListTable } from '@/modules/project-enrollment';
import { useTranslation } from '@/shared/utils/i18n';

export const MyBachelorThesesPage = () => {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 border-b pb-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('thesisProcess.myThesesPage.title')}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            {t('thesisProcess.myThesesPage.description')}
          </p>
        </div>

        <MyBachelorThesesListTable />
      </div>
    </PageLayout>
  );
};
