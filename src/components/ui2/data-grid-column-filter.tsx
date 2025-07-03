import * as React from 'react';
import { Column } from '@tanstack/react-table';
import { Filter } from 'lucide-react';
import { Button } from './button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from './dropdown-menu';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { useDataGrid } from './data-grid/context';

export interface DataGridColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export function DataGridColumnFilter<TData, TValue>({ column }: DataGridColumnFilterProps<TData, TValue>) {
  const {
    openFilterMenus,
    setOpenFilterMenus,
    tempFilters,
    setTempFilters,
    handleApplyFilter,
    handleClearFilter,
  } = useDataGrid<TData, TValue>();

  return (
    <DropdownMenu
      open={openFilterMenus[column.id]}
      onOpenChange={(open) => {
        setOpenFilterMenus((prev) => ({ ...prev, [column.id]: open }));
        if (open) {
          setTempFilters((prev) => ({
            ...prev,
            [column.id]: (column.getFilterValue() as string) ?? '',
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
            column.getIsFiltered() && 'text-primary dark:text-primary'
          )}
        >
          <Filter className="h-4 w-4 dark:text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px] p-2">
        <div className="space-y-2">
          <Input
            placeholder={`Filter ${column.id}...`}
            value={tempFilters[column.id] ?? ''}
            onChange={(e) =>
              setTempFilters((prev) => ({
                ...prev,
                [column.id]: e.target.value,
              }))
            }
            className="h-8"
          />
          <div className="flex items-center justify-between space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClearFilter(column.id)}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleApplyFilter(column.id)}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
