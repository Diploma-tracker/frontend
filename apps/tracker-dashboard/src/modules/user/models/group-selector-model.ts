import { delay } from '@/shared/utils/delay';
import { action, withAsync } from '@reatom/core';

export interface GroupOption {
  value: string;
  label: string;
}

export const loadGroupOptions = action(async (query: string): Promise<GroupOption[]> => {
  console.debug('query:', query);
  await delay(1000);

  // Return mock Group options (replace with actual API call)
  return [
    { value: 'Group1', label: 'Group One' },
    { value: 'Group2', label: 'Group Two' },
    { value: 'Group3', label: 'Group Three' },
  ];
}, 'loadGroupOptions').extend(withAsync());
