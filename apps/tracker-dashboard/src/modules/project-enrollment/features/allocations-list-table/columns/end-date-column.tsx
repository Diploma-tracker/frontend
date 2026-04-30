import { formatDate } from '@/shared/utils/format-date';
import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

const renderDate = (value: string | null | undefined) =>
  formatDate(value ?? null) ?? <span className="text-neutral-400">—</span>;

export const EndDateColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'endAt',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.endDate" />,
  cell: ({ row }) => renderDate(row.original.endAt),
};
