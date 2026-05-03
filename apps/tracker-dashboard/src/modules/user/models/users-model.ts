import { query } from '@/shared/model/query';
import { wrap } from '@reatom/core';

import { getUserById } from '@repo/api/iam';
import type { GetUserByIdDTO } from '@repo/api/model';

import { NULL_USER, type User } from './user-model';

export type { GetUserByIdDTO };

export const userQuery = query<string, User>(
  async (userId: string) => {
    const response = await wrap(getUserById(userId));
    if (!response.ok) {
      throw new Error(response.error?.message ?? 'Failed to fetch user');
    }
    return response.data;
  },
  'userQuery',
  {
    placeholder: NULL_USER,
  },
);
