import { asyncList, type AsyncListPagination } from '@/shared/model/async-list';

import type { ListTeachersResponse, TeacherDTO, TeacherSelectionFilter } from '@repo/api-types';

import { fetchListTeachers } from '../api';

export type { TeacherDTO, TeacherSelectionFilter };

export interface TeachersFilter extends AsyncListPagination, Record<string, unknown> {
  search?: string;
  selectionFilter: TeacherSelectionFilter;
}

export const teacherListAtom = asyncList<TeachersFilter, string, ListTeachersResponse>(
  {
    fetch: async (roundId: string, filters: TeachersFilter) => {
      const response = await fetchListTeachers(roundId, {
        page: filters.page,
        page_size: filters.pageSize,
        search: filters.search,
        selection_filter: filters.selectionFilter,
      });
      if (!response.ok) {
        throw new Error(response.error?.message ?? 'Failed to fetch teachers');
      }
      return response.data;
    },
    defaultFilters: {
      page: 1,
      pageSize: 10,
      selectionFilter: 'all',
    },
  },
  'teachers'
);
