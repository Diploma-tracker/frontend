import { useEffect } from 'react';

import { DataTable } from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';

import { allocationRoundListAtom } from '../../models';
import { columns } from './columns';

export const AllocationsListTable = reatomComponent(function AllocationsListTable() {
  const status = allocationRoundListAtom.status();
  const allocationRounds = allocationRoundListAtom.data();
  const filter = allocationRoundListAtom.filter();

  useEffect(() => {
    allocationRoundListAtom.fetch();
  }, []);

  return (
    <DataTable
      columns={columns}
      data={allocationRounds?.items ?? []}
      dataStatus={status}
      numberOfLoadingLines={filter.pageSize}
    />
  );
});
