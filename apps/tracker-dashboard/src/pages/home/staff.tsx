import { PageLayout } from '@/layouts';
import { UserGreeting } from '@/modules/user';

export const StaffHomePage = () => {
  return (
    <PageLayout>
      <UserGreeting />
    </PageLayout>
  );
};
