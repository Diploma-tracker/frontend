import { actionCell } from '@/shared/components/table/action-cell';
import type { Action } from '@/shared/components/table/action-cell/types';
import { T } from '@/shared/utils/i18n';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';
import { type ColumnDef } from '@tanstack/react-table';

import {
  type TeacherDTO,
  addTeachersAction,
  removeTeachersAction,
} from '../../../models';

export const createTeacherActionColumn = (
  roundId: string,
): ColumnDef<TeacherDTO> => {
  const actions: Action<TeacherDTO>[] = [
    {
      key: 'add',
      label: <T k="projectEnrollment.teacher.actions.add" />,
      icon: <PlusIcon />,
      isActive: ({ isSelected }) => !isSelected,
      action: ({ id }) =>
        wrap(addTeachersAction({ roundId, teacherIds: [id] })),
      modal: {
        title: <T k="projectEnrollment.teacher.actions.confirmAdd.title" />,
        description: (
          <T k="projectEnrollment.teacher.actions.confirmAdd.description" />
        ),
      },
    },
    {
      key: 'remove',
      label: <T k="projectEnrollment.teacher.actions.remove" />,
      icon: <TrashIcon />,
      variant: 'destructive',
      isActive: ({ isSelected }) => isSelected,
      action: ({ id }) =>
        wrap(removeTeachersAction({ roundId, teacherIds: [id] })),
      modal: {
        title: <T k="projectEnrollment.teacher.actions.confirmRemove.title" />,
        description: (
          <T k="projectEnrollment.teacher.actions.confirmRemove.description" />
        ),
      },
    },
  ];

  return {
    id: 'actions',
    header: () => <T k="projectEnrollment.teacher.table.columns.actions" />,
    cell: actionCell(actions),
  };
};
