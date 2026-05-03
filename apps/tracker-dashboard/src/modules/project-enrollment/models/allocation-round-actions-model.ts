import { t } from '@/shared/utils/i18n';
import { action, withAsync, wrap } from '@reatom/core';

import {
  closeAllocationRound,
  openAllocationRound,
} from '@repo/api/allocation-round';
import { toast } from '@repo/ui-kit/components/common/floating/sonner';

import { allocationRoundListAtom } from './list-allocation-rounds-model';

export const openAllocationRoundAction = action(async (id: string) => {
  const response = await wrap(openAllocationRound(id));

  if (!response.ok) {
    throw new Error(
      response.error?.message ??
        t('projectEnrollment.allocationRound.actions.toast.openError'),
    );
  }

  toast.success(
    t('projectEnrollment.allocationRound.actions.toast.openSuccess'),
  );
  await wrap(allocationRoundListAtom.fetch());
}, 'openAllocationRoundAction').extend(withAsync());

export const closeAllocationRoundAction = action(async (id: string) => {
  const response = await wrap(closeAllocationRound(id));

  if (!response.ok) {
    throw new Error(
      response.error?.message ??
        t('projectEnrollment.allocationRound.actions.toast.closeError'),
    );
  }

  toast.success(
    t('projectEnrollment.allocationRound.actions.toast.closeSuccess'),
  );
  await wrap(allocationRoundListAtom.fetch());
}, 'closeAllocationRoundAction').extend(withAsync());
