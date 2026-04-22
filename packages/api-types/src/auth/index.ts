export * from "./login";

import { UserRole } from "../user";

type TokenType = "access_token";

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
