export const UserRole = {
  STUDENT: 'student',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

type TokenType = 'access_token';

export interface AuthTokenPayload {
  user_id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  is_active: boolean;
  type: TokenType;
  exp: number;
  iat: number;
  nbf: number;
}
