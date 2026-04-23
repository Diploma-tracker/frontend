import { roleBasedComponent } from '@/modules/auth';
import {
  ProjectEnrollmentAdminPage,
  ProjectEnrollmentStaffPage,
  ProjectEnrollmentStudentPage,
} from '@/pages/project-enrollment';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/project-enrollment')({
  component: roleBasedComponent({
    admin: ProjectEnrollmentAdminPage,
    staff: ProjectEnrollmentStaffPage,
    student: ProjectEnrollmentStudentPage,
  }),
});
