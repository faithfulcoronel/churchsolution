import * as React from 'react';
import { flexRender } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from './table';
import { DataGridColumnHeader } from './data-grid-column-header';
import { cn } from '@/lib/utils';
import { useDataGrid } from './data-grid/context';

export function DataGridTable() {
  const {
    table,
    columns,
    loading,
    rowActions,
    onRowClick,
  } = useDataGrid<any, any>();

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="relative bg-muted/50 dark:bg-muted/40"
                >
                  {header.isPlaceholder ? null : <DataGridColumnHeader header={header} />}
                </TableHead>
              ))}
              {rowActions && <TableHead>Actions</TableHead>}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="h-96 text-center">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  onRowClick && 'cursor-pointer hover:bg-muted/50 transition-colors duration-200',
                  'group odd:bg-muted/5 dark:odd:bg-muted/40'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {rowActions(row.original)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="h-24 text-center">
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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                  </TableCell>
                ))}
                {rowActions && <TableCell />}
              </TableRow>
            ))}
          </TableFooter>
        )}
      </Table>
    </div>
  );
}


