import { useEffect } from 'react';

import { TablePagination } from '@/shared/components';
import { DataTable, type BulkActionsConfig, type TableDataConfig } from '@/shared/components/data-table/data-table';
import { T, useTranslation } from '@/shared/utils/i18n';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { addTeachersAction, removeTeachersAction, teacherListAtom, type TeacherDTO } from '../../models';
import { createTeacherColumns } from './columns';
import { TeachersFilters } from './teachers-filters';

interface TeachersListTableProps {
  roundId: string;
}

export const TeachersListTable = reatomComponent(function TeachersListTable({ roundId }: TeachersListTableProps) {
  const { t } = useTranslation();
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

  const bulkActionsConfig: BulkActionsConfig<TeacherDTO> = {
    entityLabel: (count) => t('projectEnrollment.teacher.bulkActions.entityLabel', { count }),
    actions: (selectedTeachers) => {
      const teacherIds = selectedTeachers.map((t) => t.id);

      return [
        {
          key: 'remove',
          children: (
            <>
              <TrashIcon />
              <T k="projectEnrollment.teacher.bulkActions.remove" />
            </>
          ),
          intent: 'destructive',
          onClick: () => wrap(removeTeachersAction({ roundId, teacherIds })),
        },
        {
          key: 'add',
          children: (
            <>
              <PlusIcon />
              <T k="projectEnrollment.teacher.bulkActions.add" />
            </>
          ),
          onClick: () => wrap(addTeachersAction({ roundId, teacherIds })),
        },
      ];
    },
  };

  const tableDataConfig: TableDataConfig<TeacherDTO> = {
    data: teachers?.items ?? [],
    dataStatus: status,
    getRowId: (row) => row.id,
    numberOfLoadingLines: filter.pageSize,
  };

  return (
    <div className="flex flex-col gap-4">
      <TeachersFilters />
      <DataTable columns={columns} tableDataConfig={tableDataConfig} bulkActionsConfig={bulkActionsConfig} />
      <TablePagination page={filter.page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
});
