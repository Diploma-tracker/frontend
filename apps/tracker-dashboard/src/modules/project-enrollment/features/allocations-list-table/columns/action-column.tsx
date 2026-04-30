import { actionCell } from '@/shared/components/table/action-cell';
import { T } from '@/shared/utils/i18n';
import { wrap } from '@reatom/core';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';
import { closeAllocationRoundAction, openAllocationRoundAction } from '../../../models/allocation-round-actions-model';

export const ActionColumn: ColumnDef<AllocationRoundDTO> = {
  id: 'actions',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.actions" />,
  cell: actionCell<AllocationRoundDTO>([
    {
      key: 'open',
      label: <T k="projectEnrollment.allocationRound.actions.open" />,
      isActive: ({ status }) => status === 'DRAFT',
      action: ({ id }) => wrap(openAllocationRoundAction(id)),
      modal: {
        title: <T k="projectEnrollment.allocationRound.actions.confirmOpen.title" />,
        description: <T k="projectEnrollment.allocationRound.actions.confirmOpen.description" />,
      },
    },
    {
      key: 'close',
      label: <T k="projectEnrollment.allocationRound.actions.close" />,
      isActive: ({ status }) => status === 'OPEN',
      action: ({ id }) => wrap(closeAllocationRoundAction(id)),
      modal: {
        title: <T k="projectEnrollment.allocationRound.actions.confirmClose.title" />,
        description: <T k="projectEnrollment.allocationRound.actions.confirmClose.description" />,
      },
    },
    {
      key: 'schedule',
      label: <T k="projectEnrollment.allocationRound.table.actions.viewSchedule" />,
      link: ({ id }) => ({ to: '/defense/$roundId', params: { roundId: id } }),
    },
  ]),
};
