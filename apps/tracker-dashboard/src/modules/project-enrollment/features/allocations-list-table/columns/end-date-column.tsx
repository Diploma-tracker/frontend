import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString() : <span className="text-neutral-400">—</span>;

export const EndDateColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'end_at',
  header: 'End date',
  cell: ({ row }) => formatDate(row.original.end_at),
};
