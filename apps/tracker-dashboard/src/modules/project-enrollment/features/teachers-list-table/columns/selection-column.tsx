import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';

import type { TeacherDTO } from '../../../models';

export const TeacherSelectionColumn: ColumnDef<TeacherDTO> = {
  accessorKey: 'isSelected',
  header: () => <T k="projectEnrollment.teacher.table.columns.selected" />,
  cell: ({ row }) => {
    const isSelected = row.original.isSelected;

    const intent = isSelected ? 'success' : 'draft';
    const text = isSelected
      ? 'projectEnrollment.teacher.table.selected'
      : 'projectEnrollment.teacher.table.notSelected';

    return (
      <Badge variant="filled" intent={intent}>
        <T k={text} />
      </Badge>
    );
  },
};
