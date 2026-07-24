import { action, withAsyncData } from '@reatom/core';

import { getMyBachelorTheses } from '@repo/api/bachelor-thesis';
import type { BachelorThesisDTO } from '@repo/api/model';

export type { BachelorThesisDTO };

export const myBachelorThesesAtom = action(async () => {
  const response = await getMyBachelorTheses();

  if (!response.ok) {
    throw new Error(
      response.error?.message ?? 'Failed to fetch bachelor theses',
    );
  }

  return response.data;
}, 'myBachelorTheses').extend(withAsyncData({ status: true }));
