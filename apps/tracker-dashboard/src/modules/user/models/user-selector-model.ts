import { delay } from '@/shared/utils/delay';
import { action, withAsync } from '@reatom/core';

export interface UserOption {
  value: string;
  label: string;
}

export const loadUserOptions = action(async (query: string): Promise<UserOption[]> => {
  console.debug('query:', query);
  await delay(1000);

  // Return mock user options (replace with actual API call)
  return [
    { value: 'user1', label: 'User One' },
    { value: 'user2', label: 'User Two' },
    { value: 'user3', label: 'User Three' },
  ];
}, 'loadUserOptions').extend(withAsync());
