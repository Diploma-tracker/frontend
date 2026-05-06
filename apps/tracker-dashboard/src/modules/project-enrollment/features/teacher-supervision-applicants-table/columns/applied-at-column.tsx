import { formatDate } from '@/shared/utils/format-date';
import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import type { SupervisionApplicantDTO } from '../../../models';

export const AppliedAtColumn: ColumnDef<SupervisionApplicantDTO> = {
  accessorKey: 'createdAt',
  header: () => (
    <T k="projectEnrollment.supervisionApplicants.table.columns.appliedAt" />
  ),
  cell: ({ row }) => (
    <span className="text-muted-foreground">
      {formatDate(row.original.createdAt)}
    </span>
  ),
};
