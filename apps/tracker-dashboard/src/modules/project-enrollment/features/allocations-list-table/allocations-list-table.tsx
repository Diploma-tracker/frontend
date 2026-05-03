import { useEffect } from 'react';

import {
  DataTable,
  type TableDataConfig,
} from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';

import { type AllocationRoundDTO, allocationRoundListAtom } from '../../models';
import { columns } from './columns';

export const AllocationsListTable = reatomComponent(
  function AllocationsListTable() {
    const status = allocationRoundListAtom.status();
    const allocationRounds = allocationRoundListAtom.data();
    const filter = allocationRoundListAtom.filter();

    const tableDataConfig: TableDataConfig<AllocationRoundDTO> = {
      data: allocationRounds?.items ?? [],
      dataStatus: status,
      getRowId: (row) => row.id,
      numberOfLoadingLines: filter.pageSize,
    };

    useEffect(() => {
      allocationRoundListAtom.fetch();
    }, []);

    return <DataTable columns={columns} tableDataConfig={tableDataConfig} />;
  },
);
