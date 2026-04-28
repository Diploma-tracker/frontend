import { useTranslation } from 'react-i18next';

import { PageLayout } from '@/layouts';
import { RoundDefenseSessions } from '@/modules/defense';

import '@/shared/components/week-calendar/schedule.css';

interface RoundDefenseSchedulePageProps {
  roundId: string;
}

export const RoundDefenseSchedulePage = ({ roundId }: RoundDefenseSchedulePageProps) => {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{t('defense.round.title')}</h1>
        <RoundDefenseSessions roundId={roundId} />
      </div>
    </PageLayout>
  );
};
