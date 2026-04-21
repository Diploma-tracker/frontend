export const SystemRole = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: "super_admin"
} as const;

export type SystemRole = typeof SystemRole[keyof typeof SystemRole];

export const DomainRole = {
  STUDENT: 'student',
  STAFF: 'staff',
} as const;

export type DomainRole = typeof DomainRole[keyof typeof DomainRole];