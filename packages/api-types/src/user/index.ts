export const UserRole = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  STUDENT: "STUDENT",
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
