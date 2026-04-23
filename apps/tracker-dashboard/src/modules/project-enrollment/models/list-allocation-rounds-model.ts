import { asyncList, type AsyncListPagination } from '@/shared/model/async-list';

import type { AllocationRoundDTO, AllocationRoundStatus, ListAllocationRoundsResponse } from '@repo/api-types';

import { fetchListAllocationRounds } from '../api';

export type { AllocationRoundDTO, AllocationRoundStatus };

export interface AllocationRoundsFilter extends AsyncListPagination, Record<string, unknown> {
  statusFilter: 'ALL' | AllocationRoundStatus;
}

export const allocationRoundListAtom = asyncList<AllocationRoundsFilter, void, ListAllocationRoundsResponse>(
  {
    fetch: async (_: void, filters: AllocationRoundsFilter) => {
      const response = await fetchListAllocationRounds({
        page: filters.page,
        page_size: filters.pageSize,
        status_filter: filters.statusFilter,
      });
      if (!response.ok) {
        throw new Error(response.error?.message ?? 'Failed to fetch allocation rounds');
      }
      return response.data;
    },
    defaultFilters: {
      page: 1,
      pageSize: 10,
      statusFilter: 'ALL',
    },
    noParams: true,
  },
  'allocationRounds'
);
