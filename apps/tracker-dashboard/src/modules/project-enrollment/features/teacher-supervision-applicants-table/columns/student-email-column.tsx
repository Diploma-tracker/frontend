import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import type { SupervisionApplicantDTO } from '../../../models';

export const StudentEmailColumn: ColumnDef<SupervisionApplicantDTO> = {
  accessorKey: 'studentEmail',
  header: () => (
    <T k="projectEnrollment.supervisionApplicants.table.columns.studentEmail" />
  ),
  cell: ({ row }) => (
    <span className="text-muted-foreground">{row.original.studentEmail}</span>
  ),
};
