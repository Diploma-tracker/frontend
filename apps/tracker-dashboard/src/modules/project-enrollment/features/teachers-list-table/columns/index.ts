import { getRowSelectionColumn } from '@/shared/components';
import { type ColumnDef } from '@tanstack/react-table';

import type { TeacherDTO } from '../../../models';
import { createTeacherActionColumn } from './action-column';
import { TeacherApplicationsColumn } from './applications-column';
import { TeacherEmailColumn } from './email-column';
import { TeacherNameColumn } from './name-column';
import { TeacherSelectionColumn } from './selection-column';

export const createTeacherColumns = (roundId: string): ColumnDef<TeacherDTO>[] => [
  getRowSelectionColumn(),
  TeacherNameColumn,
  TeacherEmailColumn,
  TeacherSelectionColumn,
  TeacherApplicationsColumn,
  createTeacherActionColumn(roundId),
];
