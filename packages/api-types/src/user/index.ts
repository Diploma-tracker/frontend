export const UserRole = {
  Admin: 'ADMIN',
  Staff: 'STAFF',
  Student: 'STUDENT',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];