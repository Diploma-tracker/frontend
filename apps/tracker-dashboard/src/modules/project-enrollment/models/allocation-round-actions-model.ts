import { action, withAsync, wrap } from '@reatom/core';
import i18n from 'i18next';

import { toast } from '@repo/ui-kit/components/common/floating/sonner';

import { fetchCloseAllocationRound, fetchOpenAllocationRound } from '../api';
import { allocationRoundListAtom } from './list-allocation-rounds-model';

const t = (key: string) => i18n.t(key);

export const openAllocationRoundAction = action(async (id: string) => {
  const response = await wrap(fetchOpenAllocationRound(id));

  if (!response.ok) {
    throw new Error(response.error?.message ?? t('projectEnrollment.allocationRound.actions.toast.openError'));
  }

  toast.success(t('projectEnrollment.allocationRound.actions.toast.openSuccess'));
  await wrap(allocationRoundListAtom.fetch());
}, 'openAllocationRoundAction').extend(withAsync());

export const closeAllocationRoundAction = action(async (id: string) => {
  const response = await wrap(fetchCloseAllocationRound(id));

  if (!response.ok) {
    throw new Error(response.error?.message ?? t('projectEnrollment.allocationRound.actions.toast.closeError'));
  }

  toast.success(t('projectEnrollment.allocationRound.actions.toast.closeSuccess'));
  await wrap(allocationRoundListAtom.fetch());
}, 'closeAllocationRoundAction').extend(withAsync());
