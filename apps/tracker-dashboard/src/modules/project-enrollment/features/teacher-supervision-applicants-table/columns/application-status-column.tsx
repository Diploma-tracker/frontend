import { k, useTranslation } from '@/shared/utils/i18n';
import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import type { SupervisionApplicationStatus } from '@repo/api/model';
import {
  Badge,
  type BadgeProps,
} from '@repo/ui-kit/components/common/data-display/badge';

import { type SupervisionApplicantDTO } from '../../../models';

const STATUS_META: Record<
  SupervisionApplicationStatus,
  { labelKey: string; intent: BadgeProps['intent'] }
> = {
  PENDING: {
    labelKey: k('projectEnrollment.supervisionApplicants.table.status.pending'),
    intent: 'pending',
  },
  ACCEPTED: {
    labelKey: k(
      'projectEnrollment.supervisionApplicants.table.status.accepted',
    ),
    intent: 'success',
  },
  REJECTED: {
    labelKey: k(
      'projectEnrollment.supervisionApplicants.table.status.rejected',
    ),
    intent: 'destructive',
  },
};

// eslint-disable-next-line react-refresh/only-export-components
const StatusCell = ({ status }: { status: SupervisionApplicationStatus }) => {
  const { t } = useTranslation();
  const meta = STATUS_META[status];

  return (
    <Badge variant="filled" intent={meta.intent}>
      {t(meta.labelKey)}
    </Badge>
  );
};

export const ApplicationStatusColumn: ColumnDef<SupervisionApplicantDTO> = {
  accessorKey: 'status',
  header: () => (
    <T k="projectEnrollment.supervisionApplicants.table.columns.status" />
  ),
  cell: ({ row }) => <StatusCell status={row.original.status} />,
};
