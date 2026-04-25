import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@repo/ui-kit/components/common/data-display/pagination';

export interface PaginationEllipsisConfig {
  /** Minimum number of total pages before ellipsing is applied */
  threshold: number;
  /** Number of pages to show around the current page */
  siblings: number;
  /** Number of boundary pages to show at the start; 0 = hide */
  boundaryStart: number;
  /** Number of boundary pages to show at the end; 0 = hide */
  boundaryEnd: number;
}

const DEFAULT_ELLIPSIS_CONFIG: PaginationEllipsisConfig = {
  threshold: 7,
  siblings: 1,
  boundaryStart: 1,
  boundaryEnd: 1,
};

function buildPageRange(current: number, total: number, config: PaginationEllipsisConfig): (number | 'ellipsis')[] {
  const { threshold, siblings, boundaryStart, boundaryEnd } = config;

  if (total <= threshold) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  // Leading boundary pages
  for (let i = 1; i <= Math.min(boundaryStart, total); i++) {
    pages.push(i);
  }

  const rangeStart = Math.max(boundaryStart + 1, current - siblings);
  const rangeEnd = Math.min(total - boundaryEnd, current + siblings);

  if (rangeStart > boundaryStart + 1) pages.push('ellipsis');

  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);

  if (rangeEnd < total - boundaryEnd) pages.push('ellipsis');

  // Trailing boundary pages
  for (let i = Math.max(total - boundaryEnd + 1, boundaryStart + 1); i <= total; i++) {
    pages.push(i);
  }

  return pages;
}

export interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ellipsis?: Partial<PaginationEllipsisConfig>;
}

export function TablePagination({ page, totalPages, onPageChange, ellipsis }: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const ellipsisConfig = { ...DEFAULT_ELLIPSIS_CONFIG, ...ellipsis };
  const pages = buildPageRange(page, totalPages, ellipsisConfig);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={page <= 1}
            className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
            onClick={() => onPageChange(page - 1)}
          />
        </PaginationItem>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => onPageChange(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
            onClick={() => onPageChange(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
