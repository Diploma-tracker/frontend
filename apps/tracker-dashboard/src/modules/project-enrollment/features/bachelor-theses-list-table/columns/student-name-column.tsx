import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import type { BachelorThesisDTO } from '../../../models';

export const StudentNameColumn: ColumnDef<BachelorThesisDTO> = {
  id: 'studentName',
  header: () => (
    <T k="projectEnrollment.bachelorTheses.table.columns.studentName" />
  ),
  cell: ({ row }) => (
    <span className="font-medium">
      {row.original.student.firstName} {row.original.student.lastName}
    </span>
  ),
};
