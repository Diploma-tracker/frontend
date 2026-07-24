import { useEffect, useMemo } from 'react';

import { TablePagination } from '@/shared/components';
import {
  DataTable,
  type TableDataConfig,
} from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';

import { type BachelorThesisDTO, bachelorThesesListAtom } from '../../models';
import { BachelorThesesFilters } from './bachelor-theses-filters';
import { createBachelorThesisColumns } from './columns';

interface BachelorThesesListTableProps {
  roundId: string;
}

export const BachelorThesesListTable = reatomComponent(
  function BachelorThesesListTable({ roundId }: BachelorThesesListTableProps) {
    const status = bachelorThesesListAtom.status();
    const theses = bachelorThesesListAtom.data();
    const filter = bachelorThesesListAtom.filter();

    const columns = useMemo(() => createBachelorThesisColumns(), []);

    const totalPages = theses ? Math.ceil(theses.total / filter.pageSize) : 0;

    const handlePageChange = (page: number) => {
      bachelorThesesListAtom.setFilter({ page });
    };

    const tableDataConfig: TableDataConfig<BachelorThesisDTO> = {
      data: theses?.items ?? [],
      dataStatus: status,
      getRowId: (row) => row.id,
      numberOfLoadingLines: filter.pageSize,
    };

    useEffect(() => {
      bachelorThesesListAtom.fetch(roundId);
    }, [roundId]);

    return (
      <div className="flex flex-col gap-4">
        <BachelorThesesFilters />
        <DataTable columns={columns} tableDataConfig={tableDataConfig} />
        <TablePagination
          page={filter.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    );
  },
);
