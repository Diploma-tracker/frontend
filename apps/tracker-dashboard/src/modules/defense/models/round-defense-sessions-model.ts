import { action, withAsyncData, wrap } from '@reatom/core';

import type { DefenseSessionDTO } from '@repo/api/model';
import { listDefenseSessionsForAllocationRound } from '@repo/api/thesis-defense-session';

export type { DefenseSessionDTO };

export const roundDefenseSessionsAtom = action(async (allocationRoundId: string) => {
  const response = await wrap(listDefenseSessionsForAllocationRound(allocationRoundId));
  if (!response.ok) {
    throw new Error(response.error?.message ?? 'Failed to fetch defense sessions for round');
  }
  return response.data;
}, 'roundDefenseSessionsFetch').extend(withAsyncData({ status: true }));
