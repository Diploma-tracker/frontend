import { type ColumnDef } from '@tanstack/react-table';

import type { TeacherDTO } from '../../../models';
import {
  TeacherApplicationsColumn,
  TeacherEmailColumn,
  TeacherNameColumn,
} from '../../teacher-table';
import { createStudentTeacherActionColumn } from './action-column';

export const createStudentTeacherColumns = (
  roundId: string,
): ColumnDef<TeacherDTO>[] => [
  TeacherNameColumn,
  TeacherEmailColumn,
  TeacherApplicationsColumn,
  createStudentTeacherActionColumn(roundId),
];
