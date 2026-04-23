import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { T } from '@/shared/components';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { type ColumnDef } from '@tanstack/react-table';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui-kit/components/dropdown-menu';

import type { TeacherDTO } from '../../../models';
import { AddTeacherModal } from './add-teacher-modal';
import { RemoveTeacherModal } from './remove-teacher-modal';

// eslint-disable-next-line react-refresh/only-export-components
const ActionCell = ({ row, roundId }: { row: { original: TeacherDTO }; roundId: string }) => {
  const { t } = useTranslation();
  const { id, is_selected } = row.original;
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-xs">
            <DotsThreeVerticalIcon weight="bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!is_selected && (
            <DropdownMenuItem onSelect={() => setAddModalOpen(true)}>
              {t('projectEnrollment.teacher.actions.add')}
            </DropdownMenuItem>
          )}
          {is_selected && (
            <DropdownMenuItem variant="destructive" onSelect={() => setRemoveModalOpen(true)}>
              {t('projectEnrollment.teacher.actions.remove')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {!is_selected && (
        <AddTeacherModal roundId={roundId} teacherId={id} open={addModalOpen} onOpenChange={setAddModalOpen} />
      )}
      {is_selected && (
        <RemoveTeacherModal roundId={roundId} teacherId={id} open={removeModalOpen} onOpenChange={setRemoveModalOpen} />
      )}
    </>
  );
};

export const createTeacherActionColumn = (roundId: string): ColumnDef<TeacherDTO> => ({
  id: 'actions',
  header: () => <T k="projectEnrollment.teacher.table.columns.actions" />,
  cell: ({ row }) => <ActionCell row={row} roundId={roundId} />,
});
