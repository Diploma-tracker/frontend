import { useTranslation } from 'react-i18next';

import { T } from '@/shared/components';
import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';

import type { AllocationRoundDTO, AllocationRoundStatus } from '../../../models';

const STATUS_CLASS: Record<AllocationRoundStatus, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  OPEN: 'bg-green-100 text-green-700 border-green-200',
  CLOSED: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABEL_KEY: Record<AllocationRoundStatus, string> = {
  DRAFT: 'projectEnrollment.allocationRound.status.draft',
  OPEN: 'projectEnrollment.allocationRound.status.open',
  CLOSED: 'projectEnrollment.allocationRound.status.closed',
};

// eslint-disable-next-line react-refresh/only-export-components
const StatusCell = ({ status }: { status: AllocationRoundStatus }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="outline" className={STATUS_CLASS[status] ?? ''}>
      {t(STATUS_LABEL_KEY[status] ?? status)}
    </Badge>
  );
};

export const StatusColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'status',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.status" />,
  cell: ({ row }) => <StatusCell status={row.original.status} />,
};
