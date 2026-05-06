import { actionCell } from '@/shared/components/table/action-cell';
import { T } from '@/shared/utils/i18n';
import { UserPlusIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';
import { type ColumnDef } from '@tanstack/react-table';

import {
  type TeacherDTO,
  createSupervisionApplicationAction,
} from '../../../models';

export const createStudentTeacherActionColumn = (
  roundId: string,
): ColumnDef<TeacherDTO> => {
  return {
    id: 'actions',
    header: () => <T k="projectEnrollment.teacher.table.columns.actions" />,
    cell: actionCell([
      {
        key: 'apply',
        label: <T k="projectEnrollment.teacher.actions.apply" />,
        icon: <UserPlusIcon />,
        action: ({ id }) =>
          wrap(
            createSupervisionApplicationAction({
              teacherId: id,
              allocationRoundId: roundId,
            }),
          ),
        modal: {
          title: <T k="projectEnrollment.teacher.actions.confirmApply.title" />,
          description: (
            <T k="projectEnrollment.teacher.actions.confirmApply.description" />
          ),
        },
      },
    ]),
  };
};
