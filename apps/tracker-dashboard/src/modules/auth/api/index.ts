import { API } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/client/interfaces';

import type { LoginRequest, LoginResponse } from '@repo/api-types';

export const fetchLogin = (dto: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return API.request<LoginResponse>('/auth/login', {
    method: 'POST',
    data: dto,
  });
};
