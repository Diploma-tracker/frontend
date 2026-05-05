import { useEffect } from 'react';

import { TablePagination } from '@/shared/components';
import {
  DataTable,
  type TableDataConfig,
} from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';

import { type TeacherDTO, teacherListAtom } from '../../models';
import { createStaffTeacherColumns } from './columns';
import { StaffTeachersFilters } from './staff-teachers-filters';

interface StaffTeachersListTableProps {
  roundId: string;
}

const columns = createStaffTeacherColumns();

export const StaffTeachersListTable = reatomComponent(
  function StaffTeachersListTable({ roundId }: StaffTeachersListTableProps) {
    const status = teacherListAtom.status();
    const teachers = teacherListAtom.data();
    const filter = teacherListAtom.filter();

    const totalPages = teachers
      ? Math.ceil(teachers.total / filter.pageSize)
      : 0;

    const handlePageChange = (page: number) => {
      teacherListAtom.setFilter({ page });
    };

    const tableDataConfig: TableDataConfig<TeacherDTO> = {
      data: teachers?.items ?? [],
      dataStatus: status,
      getRowId: (row) => row.id,
      numberOfLoadingLines: filter.pageSize,
    };

    useEffect(() => {
      teacherListAtom.fetch(roundId);
    }, [roundId]);

    return (
      <div className="flex flex-col gap-4">
        <StaffTeachersFilters />
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
