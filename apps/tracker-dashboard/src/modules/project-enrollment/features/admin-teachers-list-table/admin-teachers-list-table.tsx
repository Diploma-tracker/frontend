import { useEffect } from 'react';

import { TablePagination } from '@/shared/components';
import {
  type BulkActionsConfig,
  DataTable,
  type TableDataConfig,
} from '@/shared/components/data-table/data-table';
import { T, useTranslation } from '@/shared/utils/i18n';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import {
  type TeacherDTO,
  addTeachersAction,
  removeTeachersAction,
  teacherListAtom,
} from '../../models';
import { AdminTeachersFilters } from './admin-teachers-filters';
import { createTeacherColumns } from './columns';

interface AdminTeachersListTableProps {
  roundId: string;
}

export const AdminTeachersListTable = reatomComponent(
  function AdminTeachersListTable({ roundId }: AdminTeachersListTableProps) {
    const { t } = useTranslation();

    const status = teacherListAtom.status();
    const teachers = teacherListAtom.data();
    const filter = teacherListAtom.filter();

    const columns = createTeacherColumns(roundId);
    const totalPages = teachers
      ? Math.ceil(teachers.total / filter.pageSize)
      : 0;

    const handlePageChange = (page: number) => {
      teacherListAtom.setFilter({ page });
    };

    const bulkActionsConfig: BulkActionsConfig<TeacherDTO> = {
      entityLabel: (count) =>
        t('projectEnrollment.teacher.bulkActions.entityLabel', { count }),
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

    useEffect(() => {
      teacherListAtom.fetch(roundId);
    }, [roundId]);

    return (
      <div className="flex flex-col gap-4">
        <AdminTeachersFilters />
        <DataTable
          columns={columns}
          tableDataConfig={tableDataConfig}
          bulkActionsConfig={bulkActionsConfig}
        />
        <TablePagination
          page={filter.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    );
  },
);
