import { formatDate } from '@/shared/utils/format-date';
import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

const renderDate = (value: string | null | undefined) =>
  formatDate(value ?? null) ?? <span className="text-neutral-400">—</span>;

export const StartDateColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'startAt',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.startDate" />,
  cell: ({ row }) => renderDate(row.original.startAt),
};
