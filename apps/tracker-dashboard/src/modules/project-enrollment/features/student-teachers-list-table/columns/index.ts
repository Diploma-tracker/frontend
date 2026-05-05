import { type ColumnDef } from '@tanstack/react-table';

import type { TeacherDTO } from '../../../models';
import { TeacherApplicationsColumn } from '../../admin-teachers-list-table/columns/applications-column';
import { TeacherEmailColumn } from '../../admin-teachers-list-table/columns/email-column';
import { TeacherNameColumn } from '../../admin-teachers-list-table/columns/name-column';
import { createStudentTeacherActionColumn } from './action-column';

export const createStudentTeacherColumns = (
  roundId: string,
): ColumnDef<TeacherDTO>[] => [
  TeacherNameColumn,
  TeacherEmailColumn,
  TeacherApplicationsColumn,
  createStudentTeacherActionColumn(roundId),
];
