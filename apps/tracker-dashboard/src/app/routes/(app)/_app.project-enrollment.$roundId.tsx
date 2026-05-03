import { roleBasedComponent } from '@/modules/auth';
import {
  ProjectEnrollmentRoundAdminPage,
  ProjectEnrollmentRoundStaffPage,
  ProjectEnrollmentRoundStudentPage,
} from '@/pages/project-enrollment';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/project-enrollment/$roundId')(
  {
    component: roleBasedComponent({
      admin: ProjectEnrollmentRoundAdminPage,
      staff: ProjectEnrollmentRoundStaffPage,
      student: ProjectEnrollmentRoundStudentPage,
    }),
  },
);
