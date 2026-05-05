import { permissions } from '@/modules/auth';
import type { User } from '@/modules/user';
import { type ColumnDef } from '@tanstack/react-table';

import type { AllocationRoundDTO } from '../../../models';
import { ActionColumn } from './action-column';
import { EndDateColumn } from './end-date-column';
import { NameColumn } from './name-column';
import { StartDateColumn } from './start-date-column';
import { StatusColumn } from './status-column';

export const createAllocationRoundColumns = (
  user: User,
): ColumnDef<AllocationRoundDTO>[] => {
  const baseColumns = [
    NameColumn,
    StartDateColumn,
    EndDateColumn,
    StatusColumn,
  ];

  if (permissions.isAdmin(user)) {
    return [...baseColumns, ActionColumn];
  }

  return baseColumns;
};
