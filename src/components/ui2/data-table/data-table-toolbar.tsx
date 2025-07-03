import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { Input } from '../input';
import { Button } from '../button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '../dropdown-menu';
import { FileSpreadsheet, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function exportToExcel<TData>(table: Table<TData>, fileName = 'export') {
  const visibleColumns = table.getAllColumns().filter((col) => col.getIsVisible());

  const headers = visibleColumns.map((column) => {
    const headerContext = column.getContext();
    const headerContent = column.columnDef.header;
    if (typeof headerContent === 'function') {
      return headerContent(headerContext).toString();
    }
    return headerContent?.toString() || '';
  });

  const dataRows = table.getRowModel().rows.map((row) =>
    visibleColumns.map((column) => {
      const cell = row.getAllCells().find((c) => c.column.id === column.id);
      if (!cell) return '';
      const value = cell.getValue();
      if (React.isValidElement(value)) {
        return value.props.children?.toString() || '';
      }
      return value instanceof Date ? value.toLocaleDateString() : String(value ?? '');
    })
  );

  const footerRows = table.getFooterGroups().map((footerGroup) =>
    footerGroup.headers.filter((h) => h.column.getIsVisible()).map((header) => {
      const footer = header.column.columnDef.footer;
      if (!footer) return '';
      const rendered = header.column.columnDef.footer && header.column.columnDef.footer(header.getContext());
      if (React.isValidElement(rendered)) {
        return rendered.props.children?.toString() || '';
      }
      return rendered as string;
    })
  );

  const allRows = [headers, ...dataRows, ...footerRows];

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  quickFilterPlaceholder?: string;
  exportOptions?: { enabled?: boolean; excel?: boolean; fileName?: string };
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  toolbar?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar<TData>({
  table,
  quickFilterPlaceholder,
  exportOptions,
  globalFilter,
  setGlobalFilter,
  toolbar,
  className,
}: DataTableToolbarProps<TData>) {
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <div className="flex items-center gap-2">
        {toolbar}
        {quickFilterPlaceholder && (
          <Input
            size="sm"
            placeholder={quickFilterPlaceholder}
            value={globalFilter}
            onChange={(e) => {
              const value = e.target.value;
              setGlobalFilter(value);
              table.setGlobalFilter(value);
            }}
            clearable
            onClear={() => {
              setGlobalFilter('');
              table.setGlobalFilter('');
            }}
            className="h-8"
          />
        )}
        {exportOptions?.enabled && exportOptions.excel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(table, exportOptions.fileName || 'export')}
            className="flex items-center space-x-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel</span>
          </Button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Settings2 className="h-4 w-4" />
            <span>View</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
