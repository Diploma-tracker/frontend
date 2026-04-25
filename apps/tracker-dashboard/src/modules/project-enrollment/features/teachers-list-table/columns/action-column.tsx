import { T } from '@/shared/components';
import { actionCell } from '@/shared/components/table/action-cell';
import { wrap } from '@reatom/core';
import { type ColumnDef } from '@tanstack/react-table';

import { addTeachersAction, removeTeachersAction, type TeacherDTO } from '../../../models';

export const createTeacherActionColumn = (roundId: string): ColumnDef<TeacherDTO> => ({
  id: 'actions',
  header: () => <T k="projectEnrollment.teacher.table.columns.actions" />,
  cell: actionCell([
    {
      key: 'add',
      label: <T k="projectEnrollment.teacher.actions.add" />,
      isActive: ({ isSelected }) => !isSelected,
      action: ({ id }) => wrap(addTeachersAction({ roundId, teacherIds: [id] })),
      modal: {
        title: <T k="projectEnrollment.teacher.actions.confirmAdd.title" />,
        description: <T k="projectEnrollment.teacher.actions.confirmAdd.description" />,
      },
    },
    {
      key: 'remove',
      label: <T k="projectEnrollment.teacher.actions.remove" />,
      variant: 'destructive',
      isActive: ({ isSelected }) => isSelected,
      action: ({ id }) => wrap(removeTeachersAction({ roundId, teacherIds: [id] })),
      modal: {
        title: <T k="projectEnrollment.teacher.actions.confirmRemove.title" />,
        description: <T k="projectEnrollment.teacher.actions.confirmRemove.description" />,
      },
    },
  ]),
});
