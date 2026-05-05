import { useEffect } from 'react';

import { TablePagination } from '@/shared/components';
import {
  DataTable,
  type TableDataConfig,
} from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';

import { type TeacherDTO, teacherListAtom } from '../../models';
import { createStudentTeacherColumns } from './columns';
import { StudentTeachersFilters } from './student-teachers-filters';

interface StudentTeachersListTableProps {
  roundId: string;
}

export const StudentTeachersListTable = reatomComponent(
  function StudentTeachersListTable({
    roundId,
  }: StudentTeachersListTableProps) {
    const status = teacherListAtom.status();
    const teachers = teacherListAtom.data();
    const filter = teacherListAtom.filter();

    const columns = createStudentTeacherColumns(roundId);
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
        <StudentTeachersFilters />
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
