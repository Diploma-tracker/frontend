import { type AsyncListPagination, asyncList } from '@/shared/model/async-list';

import { getSupervisionApplicantsForTeacher } from '@repo/api/allocation-round';
import {
  type PaginatedSupervisionApplicantsDTO,
  type SupervisionApplicantDTO,
  type SupervisionApplicationStatus,
} from '@repo/api/model';

export type { SupervisionApplicantDTO };

export interface SupervisionApplicantsFilter
  extends AsyncListPagination, Record<string, unknown> {
  statusFilter?: SupervisionApplicationStatus | null;
}

export const teacherSupervisionApplicantsListAtom = asyncList<
  SupervisionApplicantsFilter,
  string,
  PaginatedSupervisionApplicantsDTO
>(
  {
    fetch: async (
      allocationRoundId: string,
      filters: SupervisionApplicantsFilter,
    ) => {
      const response = await getSupervisionApplicantsForTeacher(
        allocationRoundId,
        {
          page: filters.page,
          pageSize: filters.pageSize,
          statusFilter: filters.statusFilter,
        },
      );

      if (!response.ok) {
        throw new Error(
          response.error?.message ?? 'Failed to fetch supervision applicants',
        );
      }

      return response.data;
    },
    defaultFilters: {
      page: 1,
      pageSize: 10,
    },
  },
  'supervisionApplicants',
);
