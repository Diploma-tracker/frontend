import { PageLayout } from '@/layouts';
import { StudentDefenseSessions } from '@/modules/defense';

import '@/shared/components/week-calendar/schedule.css';

export const SchedulePage = function SchedulePage() {
  // <div className="h-[500px] overflow-y-hidden border-2 border-red-500 p-10">
  // <div className="h-screen max-h-screen overflow-y-hidden border-2 border-red-500 p-10">
  return (
    <PageLayout height="screen">
      <StudentDefenseSessions />
      {/*</div>*/}
    </PageLayout>
  );
};
