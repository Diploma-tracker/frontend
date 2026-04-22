import { T } from '@/shared/components';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

export const ActionColumn: ColumnDef<AllocationRoundDTO> = {
  id: 'actions',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.actions" />,
  cell: () => null,
};
