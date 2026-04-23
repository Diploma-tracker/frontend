import { roleBasedComponent } from '@/modules/auth';
import { AdminHomePage, StaffHomePage, StudentHomePage } from '@/pages/home';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/')({
  component: roleBasedComponent({
    admin: AdminHomePage,
    staff: StaffHomePage,
    student: StudentHomePage,
  }),
});
