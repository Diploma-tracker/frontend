import { query } from '@/shared/model/query';
import { wrap } from '@reatom/core';

import { getGroupById } from '@repo/api/iam';

export interface Group {
  id: string;
  name: string;
  studentCount: number;
}

const NULL_GROUP: Group = {
  id: '',
  name: '',
  studentCount: 0,
} as const;

export const groupQuery = query<string, Group>(
  async (groupId: string) => {
    const response = await wrap(getGroupById(groupId));
    if (!response.ok) {
      throw new Error(response.error?.message ?? 'Failed to fetch group');
    }
    return response.data;
  },
  'groupQuery',
  {
    placeholder: NULL_GROUP,
  },
);
