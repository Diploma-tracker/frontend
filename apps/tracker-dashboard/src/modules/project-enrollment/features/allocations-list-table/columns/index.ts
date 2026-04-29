import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';
import { ActionColumn } from './action-column';
import { EndDateColumn } from './end-date-column';
import { NameColumn } from './name-column';
import { ScheduleColumn } from './schedule-column';
import { StartDateColumn } from './start-date-column';
import { StatusColumn } from './status-column';

export const columns: ColumnDef<AllocationRoundDTO>[] = [
  NameColumn,
  StartDateColumn,
  EndDateColumn,
  StatusColumn,
  ScheduleColumn,
  ActionColumn,
];
