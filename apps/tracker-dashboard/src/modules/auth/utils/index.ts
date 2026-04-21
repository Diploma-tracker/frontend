import { jwtDecode } from 'jwt-decode';

import type { AuthTokenPayload } from '@repo/api-types';

export function decodeAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwtDecode<AuthTokenPayload>(token);
  } catch (e) {
    console.error('Failed to decode auth token:', e);
    return null;
  }
}
