import { T } from '@/shared/components';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

export const NameColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'name',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.name" />,
  cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
};
