import { type ColumnDef } from '@tanstack/react-table';

import type { SupervisionApplicantDTO } from '../../../models';
import { createApplicantActionColumn } from './action-column';
import { ApplicationStatusColumn } from './application-status-column';
import { AppliedAtColumn } from './applied-at-column';
import { StudentEmailColumn } from './student-email-column';
import { StudentNameColumn } from './student-name-column';

export const createSupervisionApplicantColumns = (
  roundId: string,
): ColumnDef<SupervisionApplicantDTO>[] => [
  StudentNameColumn,
  StudentEmailColumn,
  ApplicationStatusColumn,
  AppliedAtColumn,
  createApplicantActionColumn(roundId),
];
