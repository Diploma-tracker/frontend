import { type ColumnDef } from '@tanstack/react-table';

import type { TeacherDTO } from '../../../models';
import {
  TeacherApplicationsColumn,
  TeacherEmailColumn,
  TeacherNameColumn,
} from '../../teacher-table';

export const createStaffTeacherColumns = (): ColumnDef<TeacherDTO>[] => [
  TeacherNameColumn,
  TeacherEmailColumn,
  TeacherApplicationsColumn,
];
