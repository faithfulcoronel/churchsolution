import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '../table';
import { Loader2 } from 'lucide-react';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTableColumnHeader } from './data-table-column-header';
import { Pagination } from '../pagination';
import { cn } from '@/lib/utils';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  exportOptions?: { enabled?: boolean; excel?: boolean; fileName?: string };
  quickFilterPlaceholder?: string;
  className?: string;
  containerClassName?: string;
  fluid?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  exportOptions,
  quickFilterPlaceholder,
  className,
  containerClassName,
  fluid = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      className={cn('space-y-4 w-full h-full overflow-y-auto', fluid ? '' : 'mx-auto', containerClassName, className)}
    >
      <DataTableToolbar
        table={table}
        quickFilterPlaceholder={quickFilterPlaceholder}
        exportOptions={exportOptions}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }} className="bg-muted/50 dark:bg-muted/40">
                    {header.isPlaceholder ? null : (
                      <DataTableColumnHeader column={header.column} title={String(header.column.columnDef.header)} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-96 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {table.getFooterGroups().length > 0 && (
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <TableCell key={header.id} style={{ width: header.column.getSize() }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.footer, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          )}
        </Table>
      </div>

      <Pagination
        currentPage={pageIndex + 1}
        totalPages={Math.max(1, table.getPageCount())}
        onPageChange={(p) => table.setPageIndex(p - 1)}
        itemsPerPage={pageSize}
        totalItems={table.getFilteredRowModel().rows.length}
        onItemsPerPageChange={(size) => table.setPageSize(size)}
        showItemsPerPage
        className="border-t sticky bottom-0 bg-background z-10"
        size="sm"
      />
    </div>
  );
}
