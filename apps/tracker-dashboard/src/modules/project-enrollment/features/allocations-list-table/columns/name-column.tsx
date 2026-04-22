import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

export const NameColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'name',
  header: 'Name',
  cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
};
