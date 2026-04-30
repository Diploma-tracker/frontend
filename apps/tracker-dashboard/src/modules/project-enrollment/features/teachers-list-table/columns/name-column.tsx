import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import type { TeacherDTO } from '../../../models';

export const TeacherNameColumn: ColumnDef<TeacherDTO> = {
  id: 'name',
  header: () => <T k="projectEnrollment.teacher.table.columns.name" />,
  cell: ({ row }) => (
    <span className="font-medium">
      {row.original.firstName} {row.original.lastName}
    </span>
  ),
};
