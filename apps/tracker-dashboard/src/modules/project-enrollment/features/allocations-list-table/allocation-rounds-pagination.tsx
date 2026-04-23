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

import { allocationRoundListAtom } from '../../models';

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

export const AllocationRoundsPagination = reatomComponent(function AllocationRoundsPagination() {
  const filter = allocationRoundListAtom.filter();
  const data = allocationRoundListAtom.data();
  const setFilter = allocationRoundListAtom.setFilter;

  if (!data) return null;

  const totalPages = Math.ceil(data.total / filter.pageSize);
  if (totalPages <= 1) return null;

  const { page } = filter;
  const pages = buildPageRange(page, totalPages);

  const handlePrevious = () => setFilter({ page: page - 1 });
  const handleNext = () => setFilter({ page: page + 1 });
  const handlePageSelect = (p: number) => setFilter({ page: p });

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={page <= 1}
            className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
            onClick={handlePrevious}
          />
        </PaginationItem>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => handlePageSelect(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
            onClick={handleNext}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
});
