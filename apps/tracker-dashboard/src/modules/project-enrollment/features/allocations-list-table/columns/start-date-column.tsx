import { T } from '@/shared/components';
import { formatDate } from '@/shared/utils/format-date';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

const renderDate = (value: string | null) => formatDate(value) ?? <span className="text-neutral-400">—</span>;

export const StartDateColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'start_at',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.startDate" />,
  cell: ({ row }) => renderDate(row.original.start_at),
};
