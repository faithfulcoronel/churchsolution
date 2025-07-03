import * as React from 'react';
import { Column } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Button } from '../button';
import { cn } from '@/lib/utils';

export interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: React.ReactNode;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sortDirection = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('-ml-2 h-8 data-[state=open]:bg-accent', className)}
      onClick={() => column.toggleSorting(sortDirection === 'asc')}
    >
      <span>{title}</span>
      {sortDirection === 'desc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : sortDirection === 'asc' ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}
