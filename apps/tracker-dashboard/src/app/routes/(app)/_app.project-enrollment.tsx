import { roleBasedComponent } from '@/modules/auth';
import {
  PojectEnrollmentAdminPage,
  PojectEnrollmentStaffPage,
  PojectEnrollmentStudentPage,
} from '@/pages/project-enrollment';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/project-enrollment')({
  component: roleBasedComponent({
    admin: PojectEnrollmentAdminPage,
    staff: PojectEnrollmentStaffPage,
    student: PojectEnrollmentStudentPage,
  }),
});
