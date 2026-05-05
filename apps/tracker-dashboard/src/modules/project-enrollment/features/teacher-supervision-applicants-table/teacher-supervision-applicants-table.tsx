import { useEffect } from 'react';

import { TablePagination } from '@/shared/components';
import {
  DataTable,
  type TableDataConfig,
} from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';

import {
  type SupervisionApplicantDTO,
  teacherSupervisionApplicantsListAtom,
} from '../../models';
import { createSupervisionApplicantColumns } from './columns';
import { SupervisionApplicantsFilters } from './supervision-applicants-filters';

interface TeacherSupervisionApplicantsTableProps {
  roundId: string;
}

export const TeacherSupervisionApplicantsTable = reatomComponent(
  function TeacherSupervisionApplicantsTable({
    roundId,
  }: TeacherSupervisionApplicantsTableProps) {
    const status = teacherSupervisionApplicantsListAtom.status();
    const applicants = teacherSupervisionApplicantsListAtom.data();
    const filter = teacherSupervisionApplicantsListAtom.filter();

    const columns = createSupervisionApplicantColumns(roundId);
    const totalPages = applicants
      ? Math.ceil(applicants.total / filter.pageSize)
      : 0;

    const handlePageChange = (page: number) => {
      teacherSupervisionApplicantsListAtom.setFilter({ page });
    };

    const tableDataConfig: TableDataConfig<SupervisionApplicantDTO> = {
      data: applicants?.items ?? [],
      dataStatus: status,
      getRowId: (row) => row.applicationId,
      numberOfLoadingLines: filter.pageSize,
    };

    useEffect(() => {
      teacherSupervisionApplicantsListAtom.fetch(roundId);
    }, [roundId]);

    return (
      <div className="flex flex-col gap-4">
        <SupervisionApplicantsFilters />
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
