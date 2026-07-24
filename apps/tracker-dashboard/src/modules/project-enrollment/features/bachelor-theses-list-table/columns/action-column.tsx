import { actionCell } from '@/shared/components/table/action-cell';
import { T } from '@/shared/utils/i18n';
import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { type ColumnDef } from '@tanstack/react-table';

import type { BachelorThesisDTO } from '../../../models';

export const BachelorThesisActionColumn: ColumnDef<BachelorThesisDTO> = {
  id: 'actions',
  header: () => (
    <T k="projectEnrollment.bachelorTheses.table.columns.actions" />
  ),
  cell: actionCell(
    [
      {
        key: 'open',
        label: <T k="projectEnrollment.bachelorTheses.actions.open" />,
        icon: <ArrowSquareOutIcon />,
        link: ({ processId }) => ({
          to: '/thesis-process/$processId',
          params: { processId },
        }),
      },
    ],
    { singleButton: true },
  ),
};
