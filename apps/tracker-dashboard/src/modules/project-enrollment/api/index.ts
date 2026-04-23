import { API } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/client/interfaces';

import type {
  CreateAllocationRoundRequest,
  CreateAllocationRoundResponse,
  ListAllocationRoundsRequest,
  ListAllocationRoundsResponse,
} from '@repo/api-types';

export const fetchCreateAllocationRound = (
  dto: CreateAllocationRoundRequest
): Promise<ApiResponse<CreateAllocationRoundResponse>> => {
  return API.request<CreateAllocationRoundResponse>('/projects/allocation-rounds/', {
    method: 'POST',
    data: dto,
  });
};

export const fetchListAllocationRounds = (
  params: ListAllocationRoundsRequest
): Promise<ApiResponse<ListAllocationRoundsResponse>> => {
  return API.request<ListAllocationRoundsResponse>('/projects/allocation-rounds/', {
    method: 'GET',
    params,
  });
};

export const fetchOpenAllocationRound = (id: string): Promise<ApiResponse<void>> => {
  return API.request<void>(`/projects/allocation-rounds/${id}/open`, {
    method: 'POST',
  });
};

export const fetchCloseAllocationRound = (id: string): Promise<ApiResponse<void>> => {
  return API.request<void>(`/projects/allocation-rounds/${id}/close`, {
    method: 'POST',
  });
};
