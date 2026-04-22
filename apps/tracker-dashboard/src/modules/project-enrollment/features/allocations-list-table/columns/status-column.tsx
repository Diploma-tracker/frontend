import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';

import type { AllocationRoundDTO, AllocationRoundStatus } from '../../../models';

const statusConfig: Record<AllocationRoundStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  OPEN: { label: 'Open', className: 'bg-green-100 text-green-700 border-green-200' },
  CLOSED: { label: 'Closed', className: 'bg-red-100 text-red-700 border-red-200' },
};

// eslint-disable-next-line react-refresh/only-export-components
const StatusCell = ({ status }: { status: AllocationRoundStatus }) => {
  const config = statusConfig[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={config.className}>
      {' '}
      {config.label}{' '}
    </Badge>
  );
};

export const StatusColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => <StatusCell status={row.original.status} />,
};
