export const UserRole = {
  Admin: "ADMIN",
  Staff: "STAFF",
  Student: "STUDENT",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type User = {
  id: string;
  fullName: string;
  initials: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
};
