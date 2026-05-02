import { type ColumnDef } from '@tanstack/react-table';

import { Checkbox } from '@repo/ui-kit/components/common/form/checkbox';

import type { TeacherDTO } from '../../../models';

export const RowSelectionColumn: ColumnDef<TeacherDTO> = {
  id: 'select',
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <>
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    </>
  ),
};
