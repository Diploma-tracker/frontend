import i18n from '@/app/config/i18n';
import { T } from '@/shared/components';
import { actionCell } from '@/shared/components/table/action-cell';
import { wrap } from '@reatom/core';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';
import { closeAllocationRoundAction, openAllocationRoundAction } from '../../../models/allocation-round-actions-model';

const t = (key: string) => i18n.t(key);

export const ActionColumn: ColumnDef<AllocationRoundDTO> = {
  id: 'actions',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.actions" />,
  cell: actionCell<AllocationRoundDTO>([
    {
      name: t('projectEnrollment.allocationRound.actions.open'),
      isActive: ({ status }) => status === 'DRAFT',
      action: ({ id }) => wrap(openAllocationRoundAction(id)),
      modal: {
        title: t('projectEnrollment.allocationRound.actions.confirmOpen.title'),
        description: t('projectEnrollment.allocationRound.actions.confirmOpen.description'),
      },
    },
    {
      name: t('projectEnrollment.allocationRound.actions.close'),
      variant: 'destructive',
      isActive: ({ status }) => status === 'OPEN',
      action: ({ id }) => wrap(closeAllocationRoundAction(id)),
      modal: {
        title: t('projectEnrollment.allocationRound.actions.confirmClose.title'),
        description: t('projectEnrollment.allocationRound.actions.confirmClose.description'),
        confirmVariant: 'destructive',
      },
    },
  ]),
};
