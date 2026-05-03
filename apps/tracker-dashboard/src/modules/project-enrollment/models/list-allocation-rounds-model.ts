import { type AsyncListPagination, asyncList } from '@/shared/model/async-list';

import { getAllocationRounds } from '@repo/api/allocation-round';
import type {
  AllocationRoundDTO,
  AllocationRoundStatus,
  PaginatedAllocationRoundsDTO,
} from '@repo/api/model';

export type { AllocationRoundDTO, AllocationRoundStatus };

export interface AllocationRoundsFilter
  extends AsyncListPagination, Record<string, unknown> {
  statusFilter: 'ALL' | AllocationRoundStatus;
}

export const allocationRoundListAtom = asyncList<
  AllocationRoundsFilter,
  void,
  PaginatedAllocationRoundsDTO
>(
  {
    fetch: async (_: void, filters: AllocationRoundsFilter) => {
      const response = await getAllocationRounds({
        page: filters.page,
        pageSize: filters.pageSize,
        statusFilter: filters.statusFilter,
      });
      if (!response.ok) {
        throw new Error(
          response.error?.message ?? 'Failed to fetch allocation rounds',
        );
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
  'allocationRounds',
);
