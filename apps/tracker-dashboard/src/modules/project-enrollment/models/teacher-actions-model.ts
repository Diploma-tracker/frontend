import { action, withAsync, wrap } from '@reatom/core';

import { fetchAddTeacher, fetchRemoveTeacher } from '../api';
import { teacherListAtom } from './list-teachers-model';

export const addTeacherAction = action(async (params: { roundId: string; teacherId: string }) => {
  const response = await wrap(fetchAddTeacher(params.roundId, { teacher_id: params.teacherId }));

  if (!response.ok) {
    throw new Error(response.error?.message ?? 'Failed to add teacher');
  }

  await wrap(teacherListAtom.fetch(params.roundId));
}, 'addTeacherAction').extend(withAsync());

export const removeTeacherAction = action(async (params: { roundId: string; teacherId: string }) => {
  const response = await wrap(fetchRemoveTeacher(params.roundId, params.teacherId));

  if (!response.ok) {
    throw new Error(response.error?.message ?? 'Failed to remove teacher');
  }

  await wrap(teacherListAtom.fetch(params.roundId));
}, 'removeTeacherAction').extend(withAsync());
