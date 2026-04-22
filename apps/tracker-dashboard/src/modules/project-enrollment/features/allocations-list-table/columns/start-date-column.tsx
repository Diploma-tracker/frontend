import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString() : <span className="text-neutral-400">—</span>;

export const StartDateColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'start_at',
  header: 'Start date',
  cell: ({ row }) => formatDate(row.original.start_at),
};
