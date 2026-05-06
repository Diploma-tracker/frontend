import { actionCell } from '@/shared/components/table/action-cell';
import type { Action } from '@/shared/components/table/action-cell/types';
import { T } from '@/shared/utils/i18n';
import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';
import { type ColumnDef } from '@tanstack/react-table';

import { SupervisionApplicationStatus } from '@repo/api/model';

import {
  type SupervisionApplicantDTO,
  acceptSupervisionApplicationAction,
  rejectSupervisionApplicationAction,
} from '../../../models';

export const createApplicantActionColumn = (
  roundId: string,
): ColumnDef<SupervisionApplicantDTO> => {
  const actions: Action<SupervisionApplicantDTO>[] = [
    {
      key: 'accept',
      label: <T k="projectEnrollment.supervisionApplicants.actions.accept" />,
      icon: <CheckIcon />,
      isActive: ({ status }) => status === SupervisionApplicationStatus.PENDING,
      action: ({ applicationId }) =>
        wrap(
          acceptSupervisionApplicationAction({
            applicationId,
            allocationRoundId: roundId,
          }),
        ),
      modal: {
        title: (
          <T k="projectEnrollment.supervisionApplicants.actions.confirmAccept.title" />
        ),
        description: (
          <T k="projectEnrollment.supervisionApplicants.actions.confirmAccept.description" />
        ),
      },
    },
    {
      key: 'reject',
      label: <T k="projectEnrollment.supervisionApplicants.actions.reject" />,
      icon: <XIcon />,
      variant: 'destructive',
      isActive: ({ status }) => status === SupervisionApplicationStatus.PENDING,
      action: ({ applicationId }) =>
        wrap(
          rejectSupervisionApplicationAction({
            applicationId,
            allocationRoundId: roundId,
          }),
        ),
      modal: {
        title: (
          <T k="projectEnrollment.supervisionApplicants.actions.confirmReject.title" />
        ),
        description: (
          <T k="projectEnrollment.supervisionApplicants.actions.confirmReject.description" />
        ),
      },
    },
  ];

  return {
    id: 'actions',
    header: () => (
      <T k="projectEnrollment.supervisionApplicants.table.columns.actions" />
    ),
    cell: actionCell(actions),
  };
};
