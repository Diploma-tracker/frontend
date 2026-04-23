import { useEffect } from 'react';

import { DataTable } from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@repo/ui-kit/components/common/data-display/pagination';

import { teacherListAtom } from '../../models';
import { createTeacherColumns } from './columns';
import { TeachersFilters } from './teachers-filters';

function buildPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

interface TeachersListTableProps {
  roundId: string;
}

export const TeachersListTable = reatomComponent(function TeachersListTable({ roundId }: TeachersListTableProps) {
  const status = teacherListAtom.status();
  const teachers = teacherListAtom.data();
  const filter = teacherListAtom.filter();

  useEffect(() => {
    teacherListAtom.fetch(roundId);
  }, [roundId]);

  const columns = createTeacherColumns(roundId);

  const totalPages = teachers ? Math.ceil(teachers.total / filter.pageSize) : 0;
  const { page } = filter;
  const pages = buildPageRange(page, totalPages);

  return (
    <div className="flex flex-col gap-4">
      <TeachersFilters roundId={roundId} />
      <DataTable
        columns={columns}
        data={teachers?.items ?? []}
        dataStatus={status}
        numberOfLoadingLines={filter.pageSize}
      />

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={page <= 1}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                onClick={() => teacherListAtom.setFilter({ page: page - 1 })}
              />
            </PaginationItem>

            {pages.map((p, i) =>
              p === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink isActive={p === page} onClick={() => teacherListAtom.setFilter({ page: p })}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                onClick={() => teacherListAtom.setFilter({ page: page + 1 })}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
});
