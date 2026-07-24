import { useEffect, useMemo } from 'react';

import {
  DataTable,
  type TableDataConfig,
} from '@/shared/components/data-table/data-table';
import { reatomComponent } from '@reatom/react';

import { type BachelorThesisDTO, myBachelorThesesAtom } from '../../models';
import { createBachelorThesisColumns } from './columns';

export const MyBachelorThesesListTable = reatomComponent(
  function MyBachelorThesesListTable() {
    const status = myBachelorThesesAtom.status();
    const theses = myBachelorThesesAtom.data();

    const columns = useMemo(() => createBachelorThesisColumns(), []);

    const tableDataConfig: TableDataConfig<BachelorThesisDTO> = {
      data: theses ?? [],
      dataStatus: status,
      getRowId: (row) => row.id,
    };

    useEffect(() => {
      myBachelorThesesAtom();
    }, []);

    return <DataTable columns={columns} tableDataConfig={tableDataConfig} />;
  },
);
