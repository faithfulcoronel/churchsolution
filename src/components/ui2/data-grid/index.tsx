import * as React from 'react';
import { Button } from '../button';
import { Input } from '../input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '../dropdown-menu';
import { Settings2, FileText, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataGridProvider, DataGridProps, useDataGrid } from './context';
import { DataGridTable } from '../data-grid-table';
import { DataGridPagination } from '../data-grid-pagination';

function DataGridContent() {
  const {
    title,
    description,
    toolbar,
    exportOptions,
    handleExportExcel,
    handleExportPDF,
    quickFilterPlaceholder,
    globalFilter,
    setGlobalFilter,
    table,
    className,
    containerClassName,
    fluid,
  } = useDataGrid<any, any>();

  return (
    <div
      className={cn(
        'space-y-4 w-full',
        fluid ? '' : 'max-w-screen-xl mx-auto',
        containerClassName,
        className
      )}
    >
      {(title || description || toolbar || exportOptions.enabled) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {(title || description) && (
            <div>
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
            </div>
          )}
          <div className="flex items-center space-x-2">
            {toolbar}
            {quickFilterPlaceholder && (
              <Input
                size="sm"
                placeholder={quickFilterPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                clearable
                onClear={() => setGlobalFilter('')}
                className="h-8"
              />
            )}
            {exportOptions.enabled && (
              <div className="flex items-center space-x-2">
                {exportOptions.excel && (
                  <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel</span>
                  </Button>
                )}
                {exportOptions.pdf && (
                  <Button variant="outline" size="sm" onClick={handleExportPDF} className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </Button>
                )}
              </div>
            )}
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
        </div>
      )}

      <DataGridTable />
      <DataGridPagination />
    </div>
  );
}

export function DataGrid<TData, TValue>(props: DataGridProps<TData, TValue>) {
  return (
    <DataGridProvider {...props}>
      <DataGridContent />
    </DataGridProvider>
  );
}

export { DataGridProvider, useDataGrid } from './context';
export { DataGridTable } from '../data-grid-table';
export { DataGridPagination } from '../data-grid-pagination';

