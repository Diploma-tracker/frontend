import { T } from '@/shared/utils/i18n';
import { Link } from '@tanstack/react-router';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';

export const NameColumn: ColumnDef<AllocationRoundDTO> = {
  accessorKey: 'name',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.name" />,
  cell: ({ row }) => {
    return (
      <Link
        to="/project-enrollment/$roundId"
        params={{ roundId: row.original.id }}
        className="-m-2 block cursor-pointer p-2 font-medium hover:underline"
      >
        {row.original.name}
      </Link>
    );
  },
};
