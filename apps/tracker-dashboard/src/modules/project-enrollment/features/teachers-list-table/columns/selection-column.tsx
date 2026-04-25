import { T } from '@/shared/components';
import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';

import type { TeacherDTO } from '../../../models';

export const TeacherSelectionColumn: ColumnDef<TeacherDTO> = {
  accessorKey: 'isSelected',
  header: () => <T k="projectEnrollment.teacher.table.columns.selected" />,
  cell: ({ row }) =>
    row.original.isSelected ? (
      <Badge variant="outline" className="border-green-200 bg-green-100 text-green-700">
        <T k="projectEnrollment.teacher.table.selected" />
      </Badge>
    ) : (
      <Badge variant="outline" className="border-neutral-200 bg-neutral-100 text-neutral-600">
        <T k="projectEnrollment.teacher.table.notSelected" />
      </Badge>
    ),
};
