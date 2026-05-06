import { useEffect, useMemo } from 'react';

import { userAtom } from '@/modules/user';
import {
  DataTable,
  type TableDataConfig,
} from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';

import { type AllocationRoundDTO, allocationRoundListAtom } from '../../models';
import { createAllocationRoundColumns } from './columns';

export const AllocationsListTable = reatomComponent(
  function AllocationsListTable() {
    const user = userAtom();

    const status = allocationRoundListAtom.status();
    const allocationRounds = allocationRoundListAtom.data();
    const filter = allocationRoundListAtom.filter();

    const columns = useMemo(() => createAllocationRoundColumns(user), [user]);

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
