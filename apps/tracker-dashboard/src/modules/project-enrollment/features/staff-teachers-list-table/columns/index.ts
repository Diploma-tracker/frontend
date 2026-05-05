import { type ColumnDef } from '@tanstack/react-table';

import type { TeacherDTO } from '../../../models';
import { TeacherApplicationsColumn } from '../../admin-teachers-list-table/columns/applications-column';
import { TeacherEmailColumn } from '../../admin-teachers-list-table/columns/email-column';
import { TeacherNameColumn } from '../../admin-teachers-list-table/columns/name-column';

export const createStaffTeacherColumns = (): ColumnDef<TeacherDTO>[] => [
  TeacherNameColumn,
  TeacherEmailColumn,
  TeacherApplicationsColumn,
];
