import { useEffect } from 'react';

import { DataTable } from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';
import { useNavigate } from '@tanstack/react-router';

import type { AllocationRoundDTO } from '@repo/api-types';

import { allocationRoundListAtom } from '../../models';
import { columns } from './columns';

export const AllocationsListTable = reatomComponent(function AllocationsListTable() {
  const status = allocationRoundListAtom.status();
  const allocationRounds = allocationRoundListAtom.data();
  const filter = allocationRoundListAtom.filter();
  const navigate = useNavigate();

  useEffect(() => {
    allocationRoundListAtom.fetch();
  }, []);

  const handleRowClick = (row: AllocationRoundDTO) => {
    navigate({ to: '/project-enrollment/$roundId', params: { roundId: row.id } });
  };

  return (
    <DataTable
      columns={columns}
      data={allocationRounds?.items ?? []}
      dataStatus={status}
      numberOfLoadingLines={filter.pageSize}
      onRowClick={handleRowClick}
    />
  );
});
