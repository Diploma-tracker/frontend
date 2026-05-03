import { action, withAsyncData, wrap } from '@reatom/core';

import type { DefenseSessionDTO } from '@repo/api/model';
import { listDefenseSessionsForStudent } from '@repo/api/thesis-defense-session';

export type { DefenseSessionDTO };

export const studentDefenseSessionsAtom = action(async () => {
  const response = await wrap(listDefenseSessionsForStudent());
  if (!response.ok) {
    throw new Error(
      response.error?.message ?? 'Failed to fetch defense sessions',
    );
  }
  return response.data;
}, 'studentDefenseSessionsFetch').extend(withAsyncData({ status: true }));
