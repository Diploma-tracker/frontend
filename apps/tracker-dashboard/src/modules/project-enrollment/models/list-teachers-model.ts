import { asyncList, type AsyncListPagination } from '@/shared/model/async-list';

import { getAllocationRoundTeachers } from '@repo/api/allocation-round';
import {
  type PaginatedTeachersDTO,
  SupervisionApplicationStatus,
  type TeacherDTO,
  SelectionFilter as TeacherSelectionFilter,
} from '@repo/api/model';

export type { TeacherDTO, TeacherSelectionFilter };

export interface TeachersFilter extends AsyncListPagination, Record<string, unknown> {
  search?: string;
  selectionFilter: TeacherSelectionFilter;
}

export const teacherListAtom = asyncList<TeachersFilter, string, PaginatedTeachersDTO>(
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
  'teachers'
);

export const teacherApplicationsStatusMap = (teacherId: string) => {
  const teacher = teacherListAtom.data()?.items.find((t) => t.id === teacherId);

  if (!teacher?.isSelected) {
    return null;
  }

  const countByStatus: Record<SupervisionApplicationStatus, number> = {
    PENDING: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  };

  for (const app of teacher.applications ?? []) {
    countByStatus[app.status as SupervisionApplicationStatus] += 1;
  }

  const total = teacher.applications?.length ?? 0;

  return { countByStatus, total };
};
