import { getRowSelectionColumn } from '@/shared/components';
import { type ColumnDef } from '@tanstack/react-table';

import type { TeacherDTO } from '../../../models';
import {
  TeacherApplicationsColumn,
  TeacherEmailColumn,
  TeacherNameWithDetailsModalColumn,
} from '../../teacher-table';
import { createTeacherActionColumn } from './action-column';
import { TeacherSelectionColumn } from './selection-column';

//TODO: hide selection column when allocation round is not in "draft" status
export const createTeacherColumns = (
  roundId: string,
): ColumnDef<TeacherDTO>[] => [
  getRowSelectionColumn(),
  TeacherNameWithDetailsModalColumn,
  TeacherEmailColumn,
  TeacherSelectionColumn,
  TeacherApplicationsColumn,
  createTeacherActionColumn(roundId),
];
