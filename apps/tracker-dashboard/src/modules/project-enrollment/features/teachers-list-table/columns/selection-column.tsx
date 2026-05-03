import { T, useTranslation } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';

import type { TeacherDTO } from '../../../models';

interface SelectionBadgeCellProps {
  isSelected: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
const SelectionBadgeCell = ({ isSelected }: SelectionBadgeCellProps) => {
  const { t } = useTranslation();

  const intent = isSelected ? 'success' : 'draft';
  const text = isSelected
    ? t('projectEnrollment.teacher.table.selected')
    : t('projectEnrollment.teacher.table.notSelected');

  return (
    <Badge variant="filled" intent={intent}>
      {text}
    </Badge>
  );
};

export const TeacherSelectionColumn: ColumnDef<TeacherDTO> = {
  accessorKey: 'isSelected',
  header: () => <T k="projectEnrollment.teacher.table.columns.selected" />,
  cell: ({ row }) => (
    <SelectionBadgeCell isSelected={row.original.isSelected} />
  ),
};
