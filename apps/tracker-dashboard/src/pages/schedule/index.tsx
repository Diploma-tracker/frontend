import { PageLayout } from '@/layouts';
import { StudentDefenseSessions } from '@/modules/defense';

import '@/shared/components/week-calendar/schedule.css';

export const SchedulePage = function SchedulePage() {
  return (
    <PageLayout height="screen">
      <StudentDefenseSessions />
    </PageLayout>
  );
};
