import { renderByDataStatus, type AsyncStatusLike } from '@/shared/utils/render-by-data-status';
import { BinocularsIcon, WarningOctagonIcon } from '@phosphor-icons/react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui-kit/components/common/data-display/table';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';
import { Skeleton } from '@repo/ui-kit/components/common/states/skeleton';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  dataStatus: AsyncStatusLike;
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const { columns, data, dataStatus } = props;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderLoadingState = () => {
    return (
      <>
        {Array.from({ length: 10 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell colSpan={columns.length}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };

  const renderErrorState = () => {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WarningOctagonIcon className="text-rose-500" />
              </EmptyMedia>

              <EmptyTitle className="text-rose-700">Something went wrong</EmptyTitle>

              <EmptyDescription className="text-rose-500">
                We couldn’t load the data. <br />
                Please try again or refresh the page.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </TableCell>
      </TableRow>
    );
  };

  const renderTableEmptyState = () => {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BinocularsIcon />
              </EmptyMedia>
              <EmptyTitle>No results</EmptyTitle>
              <EmptyDescription>
                There&apos;s no data to display. <br />
                Try adjusting your search or filters.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </TableCell>
      </TableRow>
    );
  };

  const renderTableHeadRows = () => {
    const headerGroups = table.getHeaderGroups();

    return headerGroups.map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
          const cellData = header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext());

          return <TableHead key={header.id}>{cellData}</TableHead>;
        })}
      </TableRow>
    ));
  };

  const renderTableBodyRows = () => {
    const rows = table.getRowModel().rows;

    return rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
        {row.getVisibleCells().map((cell) => {
          const cellData = flexRender(cell.column.columnDef.cell, cell.getContext());

          return <TableCell key={cell.id}>{cellData}</TableCell>;
        })}
      </TableRow>
    ));
  };

  const hasData = table.getRowModel().rows.length > 0;

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>{renderTableHeadRows()}</TableHeader>
        <TableBody>
          {renderByDataStatus(dataStatus, {
            fulfilled: hasData ? renderTableBodyRows() : renderTableEmptyState(),
            pending: renderLoadingState(),
            rejected: renderErrorState(),
          })}
        </TableBody>
      </Table>
    </div>
  );
}
