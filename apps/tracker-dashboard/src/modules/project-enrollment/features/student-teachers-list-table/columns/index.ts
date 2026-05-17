import { type ColumnDef } from '@tanstack/react-table';

import type { TeacherDTO } from '../../../models';
import {
  TeacherApplicationsColumn,
  TeacherEmailColumn,
  TeacherNameWithDetailsModalColumn,
} from '../../teacher-table';
import { createStudentTeacherActionColumn } from './action-column';

export const createStudentTeacherColumns = (
  roundId: string,
): ColumnDef<TeacherDTO>[] => [
  TeacherNameWithDetailsModalColumn,
  TeacherEmailColumn,
  TeacherApplicationsColumn,
  createStudentTeacherActionColumn(roundId),
];
