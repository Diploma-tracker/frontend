import { PageLayout } from '@/layouts';
import { UserGreeting } from '@/modules/user';

export const AdminHomePage = () => {
  return (
    <PageLayout>
      <UserGreeting />
    </PageLayout>
  );
};
