import { actionCell } from '@/shared/components/table/action-cell';
import { T } from '@/shared/utils/i18n';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';
import { type ColumnDef } from '@tanstack/react-table';

import { addTeachersAction, removeTeachersAction, type TeacherDTO } from '../../../models';

export const createTeacherActionColumn = (roundId: string): ColumnDef<TeacherDTO> => ({
  id: 'actions',
  header: () => <T k="projectEnrollment.teacher.table.columns.actions" />,
  cell: actionCell([
    {
      key: 'add',
      label: <PlusIcon />,
      variant: 'ghost',
      size: 'icon-sm',
      isActive: ({ isSelected }) => !isSelected,
      action: ({ id }) => wrap(addTeachersAction({ roundId, teacherIds: [id] })),
      modal: {
        title: <T k="projectEnrollment.teacher.actions.confirmAdd.title" />,
        description: <T k="projectEnrollment.teacher.actions.confirmAdd.description" />,
      },
    },
    {
      key: 'remove',
      label: <TrashIcon />,
      variant: 'ghost',
      intent: 'destructive',
      size: 'icon-sm',
      isActive: ({ isSelected }) => isSelected,
      action: ({ id }) => wrap(removeTeachersAction({ roundId, teacherIds: [id] })),
      modal: {
        title: <T k="projectEnrollment.teacher.actions.confirmRemove.title" />,
        description: <T k="projectEnrollment.teacher.actions.confirmRemove.description" />,
        confirmIntent: 'destructive',
      },
    },
  ]),
});
