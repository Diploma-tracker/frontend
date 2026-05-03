import { action, withAsync, wrap } from '@reatom/core';

import {
  addTeachersToAllocationRound,
  removeTeachersFromAllocationRound,
} from '@repo/api/allocation-round';

import { teacherListAtom } from './list-teachers-model';

export const addTeachersAction = action(
  async (params: { roundId: string; teacherIds: string[] }) => {
    const response = await wrap(
      addTeachersToAllocationRound(params.roundId, {
        teacherIds: params.teacherIds,
      }),
    );

    if (!response.ok) {
      throw new Error(response.error?.message ?? 'Failed to add teacher');
    }

    await wrap(teacherListAtom.fetch(params.roundId));
  },
  'addTeachersAction',
).extend(withAsync());

export const removeTeachersAction = action(
  async (params: { roundId: string; teacherIds: string[] }) => {
    const response = await wrap(
      removeTeachersFromAllocationRound(params.roundId, {
        teacherIds: params.teacherIds,
      }),
    );

    if (!response.ok) {
      throw new Error(response.error?.message ?? 'Failed to remove teacher');
    }

    await wrap(teacherListAtom.fetch(params.roundId));
  },
  'removeTeachersAction',
).extend(withAsync());
