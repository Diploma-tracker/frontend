import { PageLayout } from '@/layouts';
import { UserGreeting } from '@/modules/user';

export const StudentHomePage = () => {
  return (
    <PageLayout>
      <UserGreeting />
    </PageLayout>
  );
};
