import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

export const ActionColumn: ColumnDef<AllocationRoundDTO> = {
  id: 'actions',
  header: 'Actions',
  cell: () => null,
};
