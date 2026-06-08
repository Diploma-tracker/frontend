import { type AsyncListPagination, asyncList } from '@/shared/model/async-list';

import { listBachelorThesesForAllocationRound } from '@repo/api/allocation-round';
import {
  type BachelorThesisDTO,
  type PaginatedBachelorThesesDTO,
} from '@repo/api/model';

export type { BachelorThesisDTO };

export interface BachelorThesesFilter
  extends AsyncListPagination, Record<string, unknown> {
  search?: string;
}

export const bachelorThesesListAtom = asyncList<
  BachelorThesesFilter,
  string,
  PaginatedBachelorThesesDTO
>(
  {
    fetch: async (roundId: string, filters: BachelorThesesFilter) => {
      const response = await listBachelorThesesForAllocationRound(roundId, {
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
      });

      if (!response.ok) {
        throw new Error(
          response.error?.message ?? 'Failed to fetch bachelor theses',
        );
      }

      return response.data;
    },
    defaultFilters: {
      page: 1,
      pageSize: 10,
    },
  },
  'bachelorTheses',
);
