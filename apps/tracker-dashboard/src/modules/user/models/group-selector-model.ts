import { action, withAsync, wrap } from '@reatom/core';

import { listGroups } from '@repo/api/iam';

export interface GroupOption {
  value: string;
  label: string;
}

const SHOWN_GROUPS = 5;

export const loadGroupOptions = action(async (query: string): Promise<GroupOption[]> => {
  const result = await wrap(
    listGroups({
      page: 1,
      pageSize: SHOWN_GROUPS,
      search: query,
    })
  );

  if (!result.ok) {
    return [];
  }

  return result.data.items.map((u) => ({
    value: u.id,
    label: u.name,
  }));
}, 'loadGroupOptions').extend(withAsync());
