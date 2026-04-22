export const UserRole = {
  STUDENT: "student",
  STAFF: "staff",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
