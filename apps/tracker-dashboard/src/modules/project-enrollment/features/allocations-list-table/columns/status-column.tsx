import { k, useTranslation } from '@/shared/utils/i18n';
import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import { Badge, type BadgeProps } from '@repo/ui-kit/components/common/data-display/badge';

import type { AllocationRoundDTO, AllocationRoundStatus } from '../../../models';

const STATUS_CLASS: Record<AllocationRoundStatus, BadgeProps['intent']> = {
  DRAFT: 'draft',
  OPEN: 'success',
  CLOSED: 'destructive',
};

const STATUS_LABEL_KEY: Record<AllocationRoundStatus, string> = {
  DRAFT: k('projectEnrollment.allocationRound.status.draft'),
  OPEN: k('projectEnrollment.allocationRound.status.open'),
  CLOSED: k('projectEnrollment.allocationRound.status.closed'),
};

// eslint-disable-next-line react-refresh/only-export-components
const StatusCell = ({ status }: { status: AllocationRoundStatus }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="filled" intent={STATUS_CLASS[status]}>
      {t(STATUS_LABEL_KEY[status] ?? status)}
    </Badge>
  );
};

export const StatusColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'status',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.status" />,
  cell: ({ row }) => <StatusCell status={row.original.status} />,
};
