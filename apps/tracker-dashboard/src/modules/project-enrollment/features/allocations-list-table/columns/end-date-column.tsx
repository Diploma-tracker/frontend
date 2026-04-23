import { T } from '@/shared/components';
import { formatDate } from '@/shared/utils/format-date';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

const renderDate = (value: string | null) => formatDate(value) ?? <span className="text-neutral-400">—</span>;

export const EndDateColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'end_at',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.endDate" />,
  cell: ({ row }) => renderDate(row.original.end_at),
};
