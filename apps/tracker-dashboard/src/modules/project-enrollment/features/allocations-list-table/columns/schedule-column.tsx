import { T } from '@/shared/components';
import { CalendarIcon } from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';
import { type ColumnDef } from '@tanstack/react-table';

import { Button } from '@repo/ui-kit/components/common/data-display/button';

import type { AllocationRoundDTO } from '../../../models';

export const ScheduleColumn: ColumnDef<AllocationRoundDTO> = {
  id: 'schedule',
  header: () => <T k="projectEnrollment.allocationRound.table.columns.schedule" />,
  cell: ({ row }) => (
    <Link to="/defense/$roundId" params={{ roundId: row.original.id }} onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="sm" className="gap-1.5">
        <CalendarIcon className="size-4" />
        <T k="projectEnrollment.allocationRound.table.actions.viewSchedule" />
      </Button>
    </Link>
  ),
};
