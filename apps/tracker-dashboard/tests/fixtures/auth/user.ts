import type { User } from '@/modules/user';

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    email: 'user@test.test',
    firstName: 'Test',
    lastName: 'Test',
    isActive: true,
    role: 'admin',
    ...overrides,
  };
}
