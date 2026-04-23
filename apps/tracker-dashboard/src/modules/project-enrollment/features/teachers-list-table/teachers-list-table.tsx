import { useEffect } from 'react';

import { TablePagination } from '@/shared/components';
import { DataTable } from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';

import { teacherListAtom } from '../../models';
import { createTeacherColumns } from './columns';
import { TeachersFilters } from './teachers-filters';

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

  const handlePageChange = (page: number) => {
    teacherListAtom.setFilter({ page });
  };

  return (
    <div className="flex flex-col gap-4">
      <TeachersFilters roundId={roundId} />
      <DataTable
        columns={columns}
        data={teachers?.items ?? []}
        dataStatus={status}
        numberOfLoadingLines={filter.pageSize}
      />
      <TablePagination page={filter.page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
});
