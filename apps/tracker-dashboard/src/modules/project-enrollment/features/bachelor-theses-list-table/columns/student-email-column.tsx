import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import type { BachelorThesisDTO } from '../../../models';

export const StudentEmailColumn: ColumnDef<BachelorThesisDTO> = {
  id: 'studentEmail',
  header: () => (
    <T k="projectEnrollment.bachelorTheses.table.columns.studentEmail" />
  ),
  cell: ({ row }) => (
    <span className="text-muted-foreground">{row.original.student.email}</span>
  ),
};
