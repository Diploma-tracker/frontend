import { t } from '@/shared/utils/i18n';
import { action, withAsync, wrap } from '@reatom/core';

import {
  acceptSupervisionApplication,
  createSupervisionApplication,
  rejectSupervisionApplication,
} from '@repo/api/supervision-application';
import { toast } from '@repo/ui-kit/components/common/floating/sonner';

import { teacherSupervisionApplicantsListAtom } from './list-teacher-supervision-applicants';
import { teacherListAtom } from './list-teachers-model';

export const createSupervisionApplicationAction = action(
  async (params: { teacherId: string; allocationRoundId: string }) => {
    const response = await wrap(createSupervisionApplication(params));

    if (!response.ok) {
      toast.error(
        t('projectEnrollment.supervisionApplicants.actions.toast.createError'),
      );

      throw new Error(
        response.error?.message ?? 'Failed to create supervision application',
      );
    }

    toast.success(
      t('projectEnrollment.supervisionApplicants.actions.toast.createSuccess'),
    );
    await wrap(teacherListAtom.fetch(params.allocationRoundId));
  },
  'createSupervisionApplication',
).extend(withAsync());

export const acceptSupervisionApplicationAction = action(
  async (params: { applicationId: string; allocationRoundId: string }) => {
    const response = await wrap(
      acceptSupervisionApplication(params.applicationId),
    );

    if (!response.ok) {
      toast.error(
        t('projectEnrollment.supervisionApplicants.actions.toast.acceptError'),
      );

      throw new Error(
        response.error?.message ?? 'Failed to accept supervision application',
      );
    }

    toast.success(
      t('projectEnrollment.supervisionApplicants.actions.toast.acceptSuccess'),
    );
    await Promise.all([
      wrap(teacherListAtom.fetch(params.allocationRoundId)),
      wrap(
        teacherSupervisionApplicantsListAtom.fetch(params.allocationRoundId),
      ),
    ]);
  },
  'acceptSupervisionApplication',
).extend(withAsync());

export const rejectSupervisionApplicationAction = action(
  async (params: { applicationId: string; allocationRoundId: string }) => {
    const response = await wrap(
      rejectSupervisionApplication(params.applicationId),
    );

    if (!response.ok) {
      toast.error(
        t('projectEnrollment.supervisionApplicants.actions.toast.rejectError'),
      );

      throw new Error(
        response.error?.message ?? 'Failed to reject supervision application',
      );
    }

    toast.success(
      t('projectEnrollment.supervisionApplicants.actions.toast.rejectSuccess'),
    );
    await Promise.all([
      wrap(teacherListAtom.fetch(params.allocationRoundId)),
      wrap(
        teacherSupervisionApplicantsListAtom.fetch(params.allocationRoundId),
      ),
    ]);
  },
  'rejectSupervisionApplication',
).extend(withAsync());
