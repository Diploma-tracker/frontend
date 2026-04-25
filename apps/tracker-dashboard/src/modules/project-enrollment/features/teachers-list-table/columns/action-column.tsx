import i18n from '@/app/config/i18n';
import { T } from '@/shared/components';
import { actionCell } from '@/shared/components/table/action-cell';
import { wrap } from '@reatom/core';
import { type ColumnDef } from '@tanstack/react-table';

import { addTeachersAction, removeTeachersAction, type TeacherDTO } from '../../../models';

const t = (key: string) => i18n.t(key);

export const createTeacherActionColumn = (roundId: string): ColumnDef<TeacherDTO> => ({
  id: 'actions',
  header: () => <T k="projectEnrollment.teacher.table.columns.actions" />,
  cell: actionCell([
    {
      name: t('projectEnrollment.teacher.actions.add'),
      isActive: ({ isSelected }) => !isSelected,
      action: ({ id }) => wrap(addTeachersAction({ roundId, teacherIds: [id] })),
      modal: {
        title: t('projectEnrollment.teacher.actions.confirmAdd.title'),
        description: t('projectEnrollment.teacher.actions.confirmAdd.description'),
      },
    },
    {
      name: t('projectEnrollment.teacher.actions.remove'),
      variant: 'destructive',
      isActive: ({ isSelected }) => isSelected,
      action: ({ id }) => wrap(removeTeachersAction({ roundId, teacherIds: [id] })),
      modal: {
        title: t('projectEnrollment.teacher.actions.confirmRemove.title'),
        description: t('projectEnrollment.teacher.actions.confirmRemove.description'),
      },
    },
  ]),
});
