export * from './login';

import { DomainRole, SystemRole } from '../user'

type TokenType = 'access_token';

export interface AuthTokenPayload {
  user_id: string;
  email: string;
  system_role: SystemRole;
  domain_role: DomainRole;
  first_name: string;
  last_name: string;
  is_active: boolean;
  type: TokenType;
  exp: number;
  iat: number;
  nbf: number;
}