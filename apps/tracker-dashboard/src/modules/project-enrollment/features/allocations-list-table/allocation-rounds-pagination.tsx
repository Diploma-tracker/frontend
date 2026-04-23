import { TablePagination } from '@/shared/components';
import { reatomComponent } from '@reatom/react';

import { allocationRoundListAtom } from '../../models';

export const AllocationRoundsPagination = reatomComponent(function AllocationRoundsPagination() {
  const filter = allocationRoundListAtom.filter();
  const data = allocationRoundListAtom.data();

  if (!data) return null;

  const totalPages = Math.ceil(data.total / filter.pageSize);

  const handlePageChange = (page: number) => {
    allocationRoundListAtom.setFilter({ page });
  };

  return <TablePagination page={filter.page} totalPages={totalPages} onPageChange={handlePageChange} />;
});
