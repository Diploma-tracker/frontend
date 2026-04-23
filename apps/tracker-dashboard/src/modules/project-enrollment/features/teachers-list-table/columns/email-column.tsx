import { T } from '@/shared/components';
import { type ColumnDef } from '@tanstack/react-table';

import type { TeacherDTO } from '../../../models';

export const TeacherEmailColumn: ColumnDef<TeacherDTO> = {
  accessorKey: 'email',
  header: () => <T k="projectEnrollment.teacher.table.columns.email" />,
  cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
};
