import { API } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/client/interfaces';

import type { CreateAllocationRoundRequest, CreateAllocationRoundResponse } from '@repo/api-types';

export const fetchCreateAllocationRound = (
  dto: CreateAllocationRoundRequest
): Promise<ApiResponse<CreateAllocationRoundResponse>> => {
  return API.request<CreateAllocationRoundResponse>('/projects/allocation-rounds/', {
    method: 'POST',
    data: dto,
  });
};
