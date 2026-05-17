import { type ColumnDef } from '@tanstack/react-table';

import type { TeacherDTO } from '../../../models';
import {
  TeacherApplicationsColumn,
  TeacherEmailColumn,
  TeacherNameWithDetailsModalColumn,
} from '../../teacher-table';

export const createStaffTeacherColumns = (): ColumnDef<TeacherDTO>[] => [
  TeacherNameWithDetailsModalColumn,
  TeacherEmailColumn,
  TeacherApplicationsColumn,
];
