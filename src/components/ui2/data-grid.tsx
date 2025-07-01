import * as React from 'react';
import {
  DataGrid as ReDataGrid,
  GridToolbar,
  type GridColDef,
  type GridSortModel,
  type GridFilterModel,
  type GridPaginationModel,
} from '@reui/data-grid';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Button } from './button';
import { Container } from './container';
import { cn } from '@/lib/utils';
import { FileSpreadsheet, FileText } from 'lucide-react';

export interface DataGridProps<T> {
  columns: GridColDef[];
  data: T[];
  loading?: boolean;
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  error?: string;
  page?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  sortingModel?: GridSortModel;
  onSortingModelChange?: (model: GridSortModel) => void;
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  exportOptions?: {
    enabled?: boolean;
    fileName?: string;
    pdf?: boolean;
    excel?: boolean;
  };
  quickFilterPlaceholder?: string;
  className?: string;
}

export function DataGrid<T>({
  columns,
  data,
  loading = false,
  title,
  description,
  toolbar,
  rowActions,
  onRowClick,
  error,
  page = 0,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  sortingModel,
  onSortingModelChange,
  filterModel,
  onFilterModelChange,
  exportOptions = { enabled: true, fileName: 'export', pdf: true, excel: true },
  quickFilterPlaceholder,
  className,
}: DataGridProps<T>) {
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    onPageChange?.(model.page);
    onPageSizeChange?.(model.pageSize);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const headers = columns.map((c) => c.headerName || c.field);
    const rows = data.map((row: any) =>
      columns.map((c) => {
        const value = row[c.field as keyof typeof row];
        if (value instanceof Date) return value.toLocaleDateString();
        return String(value ?? '');
      })
    );
    (doc as any).autoTable({ head: [headers], body: rows, startY: 20 });
    doc.save(`${exportOptions.fileName || 'export'}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = columns.map((c) => c.headerName || c.field);
    const rows = data.map((row: any) =>
      columns.map((c) => row[c.field as keyof typeof row])
    );
    const allRows = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${exportOptions.fileName || 'export'}.xlsx`);
  };

  return (
    <Container className={cn('space-y-4', className)}>
      {(title || description || toolbar || exportOptions.enabled) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {(title || description) && (
            <div>
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              {description && (
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          <div className="flex items-center space-x-2">
            {toolbar}
            {exportOptions.enabled && (
              <div className="flex items-center space-x-2">
                {exportOptions.excel && (
                  <Button variant="outline" size="sm" onClick={handleExportExcel}>
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel</span>
                  </Button>
                )}
                {exportOptions.pdf && (
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <ReDataGrid
        columns={columns}
        rows={data}
        loading={loading}
        sortingModel={sortingModel}
        filterModel={filterModel}
        onSortingModelChange={onSortingModelChange}
        onFilterModelChange={onFilterModelChange}
        pageSizeOptions={pageSizeOptions}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        onRowClick={(params) => onRowClick?.(params.row)}
        error={!!error}
        slots={{
          toolbar: GridToolbar,
          ...(error
            ? { errorOverlay: () => (
                <div className="p-4 text-destructive text-sm text-center w-full">
                  {error}
                </div>
              ) }
            : {}),
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: !!quickFilterPlaceholder,
            quickFilterProps: { placeholder: quickFilterPlaceholder },
          },
        }}
        autoHeight
      />
    </Container>
  );
}
