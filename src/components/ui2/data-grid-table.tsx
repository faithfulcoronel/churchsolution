import * as React from 'react';
import { flexRender } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from './table';
import { Button } from './button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from './dropdown-menu';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { useDataGrid } from './data-grid/context';

export function DataGridTable() {
  const {
    table,
    columns,
    loading,
    rowActions,
    onRowClick,
    openFilterMenus,
    setOpenFilterMenus,
    tempFilters,
    setTempFilters,
    handleApplyFilter,
    handleClearFilter,
  } = useDataGrid<any, any>();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div className="flex items-center space-x-2">
                      <div
                        className={cn(
                          'flex items-center space-x-2',
                          header.column.getCanSort() && 'cursor-pointer select-none'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span>
                            {{
                              asc: <ArrowUp className="h-4 w-4 dark:text-gray-300" />,
                              desc: <ArrowDown className="h-4 w-4 dark:text-gray-300" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ArrowUpDown className="h-4 w-4 dark:text-gray-400" />
                            )}
                          </span>
                        )}
                      </div>
                      {header.column.getCanFilter() && (
                        <DropdownMenu
                          open={openFilterMenus[header.id]}
                          onOpenChange={(open) => {
                            setOpenFilterMenus((prev) => ({ ...prev, [header.id]: open }));
                            if (open) {
                              setTempFilters((prev) => ({
                                ...prev,
                                [header.column.id]: (header.column.getFilterValue() as string) ?? '',
                              }));
                            }
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'h-8 w-8 p-0',
                                header.column.getIsFiltered() && 'text-primary dark:text-primary'
                              )}
                            >
                              <Filter className="h-4 w-4 dark:text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[200px] p-2">
                            <div className="space-y-2">
                              <Input
                                placeholder={`Filter ${header.column.id}...`}
                                value={tempFilters[header.column.id] ?? ''}
                                onChange={(e) =>
                                  setTempFilters((prev) => ({
                                    ...prev,
                                    [header.column.id]: e.target.value,
                                  }))
                                }
                                className="h-8"
                              />
                              <div className="flex items-center justify-between space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleClearFilter(header.column.id)}
                                  className="flex-1"
                                >
                                  Clear
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApplyFilter(header.column.id)}
                                  className="flex-1"
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )}
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
                  'group'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
                  <TableCell key={header.id}>
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


