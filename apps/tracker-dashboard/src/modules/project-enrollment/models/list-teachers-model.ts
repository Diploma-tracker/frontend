import { type AsyncListPagination, asyncList } from '@/shared/model/async-list';

import { getAllocationRoundTeachers } from '@repo/api/allocation-round';
import {
  type ApplicationDTO,
  type PaginatedTeachersDTO,
  SupervisionApplicationStatus,
  type TeacherDTO,
  SelectionFilter as TeacherSelectionFilter,
} from '@repo/api/model';

export type { TeacherDTO, TeacherSelectionFilter };

export interface TeachersFilter
  extends AsyncListPagination, Record<string, unknown> {
  search?: string;
  selectionFilter: TeacherSelectionFilter;
}

type GroupedApplications = Record<
  SupervisionApplicationStatus,
  ApplicationDTO[]
>;

type ApplicationsStats = {
  countByStatus: Record<SupervisionApplicationStatus, number>;
  groupedApplications: GroupedApplications;
};

export const teacherListAtom = asyncList<
  TeachersFilter,
  string,
  PaginatedTeachersDTO
>(
  {
    fetch: async (roundId: string, filters: TeachersFilter) => {
      const response = await getAllocationRoundTeachers(roundId, {
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
        selectionFilter: filters.selectionFilter,
      });

      if (!response.ok) {
        throw new Error(response.error?.message ?? 'Failed to fetch teachers');
      }

      return response.data;
    },
    defaultFilters: {
      page: 1,
      pageSize: 10,
      selectionFilter: TeacherSelectionFilter.ALL,
    },
  },
  'teachers',
);

export const getTeacherApplicationsStats = (teacher: TeacherDTO) => {
  if (!teacher?.isSelected) {
    return null;
  }

  const initialState: ApplicationsStats = {
    countByStatus: {
      PENDING: 0,
      ACCEPTED: 0,
      REJECTED: 0,
    },

    groupedApplications: {
      PENDING: [],
      ACCEPTED: [],
      REJECTED: [],
    },
  };

  const aggregate = (acc: ApplicationsStats, application: ApplicationDTO) => {
    const status = application.status as SupervisionApplicationStatus;

    acc.countByStatus[status] += 1;
    acc.groupedApplications[status].push(application);

    return acc;
  };

  const result = (teacher.applications ?? []).reduce(aggregate, initialState);

  return {
    ...result,
    total: teacher.applications?.length ?? 0,
  };
};
