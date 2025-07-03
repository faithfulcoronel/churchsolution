import * as React from 'react';
import { flexRender, Header } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataGridColumnFilter } from './data-grid-column-filter';

export interface DataGridColumnHeaderProps<TData, TValue> {
  header: Header<TData, TValue>;
}

export function DataGridColumnHeader<TData, TValue>({ header }: DataGridColumnHeaderProps<TData, TValue>) {
  const column = header.column;

  return (
    <div className="flex items-center space-x-2 relative">
      <div
        className={cn(
          'flex items-center space-x-2',
          column.getCanSort() && 'cursor-pointer select-none'
        )}
        onClick={column.getToggleSortingHandler()}
      >
        {flexRender(column.columnDef.header, header.getContext())}
        {column.getCanSort() && (
          <span className="ml-2">
            {{
              asc: <ArrowUp className="h-4 w-4 dark:text-muted-foreground" />,
              desc: <ArrowDown className="h-4 w-4 dark:text-muted-foreground" />,
            }[column.getIsSorted() as string] ?? (
              <ArrowUpDown className="h-4 w-4 dark:text-muted-foreground" />
            )}
          </span>
        )}
      </div>
      {column.getCanFilter() && <DataGridColumnFilter column={column} />}
      {column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            'absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none bg-border dark:bg-muted hover:bg-primary/10 transition-colors',
            header.column.getIsResizing() && 'bg-primary/20'
          )}
        />
      )}
    </div>
  );
}
