import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import type { SupervisionApplicantDTO } from '../../../models';

export const StudentNameColumn: ColumnDef<SupervisionApplicantDTO> = {
  id: 'studentName',
  header: () => (
    <T k="projectEnrollment.supervisionApplicants.table.columns.studentName" />
  ),
  cell: ({ row }) => (
    <span className="font-medium">
      {row.original.studentFirstName} {row.original.studentLastName}
    </span>
  ),
};
