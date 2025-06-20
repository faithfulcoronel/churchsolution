import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from './table';
import { Button } from './button';
import { Container } from './container';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './dropdown-menu';
import { Input } from './input';
import { cn } from '@/lib/utils';
import {
  Settings2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  FileText,
  FileSpreadsheet,
  Filter,
  X,
  Check,
} from 'lucide-react';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  rowActions?: (row: TData) => React.ReactNode;
  onRowClick?: (row: TData) => void;
  pagination?: {
    pageSize?: number;
    pageSizeOptions?: number[];
  };
  className?: string;
  exportOptions?: {
    enabled?: boolean;
    fileName?: string;
    pdf?: boolean;
    excel?: boolean;
  };
}

export function DataGrid<TData, TValue>({
  columns,
  data,
  loading = false,
  title,
  description,
  toolbar,
  rowActions,
  onRowClick,
  pagination = {
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
  },
  className,
  exportOptions = {
    enabled: true,
    fileName: 'export',
    pdf: true,
    excel: true,
  },
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [openFilterMenus, setOpenFilterMenus] = React.useState<Record<string, boolean>>({});
  const [tempFilters, setTempFilters] = React.useState<Record<string, string>>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handleApplyFilter = (columnId: string) => {
    const filterValue = tempFilters[columnId];
    const column = table.getColumn(columnId);
    if (column) {
      column.setFilterValue(filterValue);
    }
    setOpenFilterMenus((prev) => ({ ...prev, [columnId]: false }));
  };

  const handleClearFilter = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (column) {
      column.setFilterValue(null);
      setTempFilters((prev) => ({ ...prev, [columnId]: '' }));
    }
    setOpenFilterMenus((prev) => ({ ...prev, [columnId]: false }));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title if provided
    if (title) {
      doc.setFontSize(16);
      doc.text(title, 20, 20);
    }

    // Get visible columns
    const visibleColumns = table.getAllColumns().filter(col => col.getIsVisible());

    // Get headers
    const headers = visibleColumns.map(column => {
      const headerContext = column.getContext();
      const headerContent = column.columnDef.header;
      if (typeof headerContent === 'function') {
        return headerContent(headerContext).toString();
      }
      return headerContent?.toString() || '';
    });

    // Get table data
    const tableData = table.getRowModel().rows.map(row =>
      visibleColumns.map(column => {
        const cell = row.getAllCells().find(cell => cell.column.id === column.id);
        if (!cell) return '';
        const value = cell.getValue();
        // Convert React elements to string representation
        if (React.isValidElement(value)) {
          return value.props.children?.toString() || '';
        }
        return value instanceof Date ? value.toLocaleDateString() : String(value);
      })
    );

    // Get footer data
    const footerData = table.getFooterGroups().map(footerGroup =>
      footerGroup.headers.filter(header => header.column.getIsVisible()).map(header => {
        const footer = header.column.columnDef.footer;
        if (!footer) return '';
        const rendered = flexRender(footer, header.getContext());
        // Convert React elements to string representation
        if (React.isValidElement(rendered)) {
          return rendered.props.children?.toString() || '';
        }
        return String(rendered);
      })
    );

    // Configure table options
    const tableOptions = {
      head: [headers],
      body: tableData,
      foot: footerData,
      startY: title ? 30 : 20,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    };

    // Create table
    (doc as any).autoTable(tableOptions);

    // Save the file
    doc.save(`${exportOptions.fileName || 'export'}.pdf`);
  };

  const handleExportExcel = () => {
    // Get visible columns
    const visibleColumns = table.getAllColumns().filter(col => col.getIsVisible());

    // Get headers
    const headers = visibleColumns.map(column => {
      const headerContext = column.getContext();
      const headerContent = column.columnDef.header;
      if (typeof headerContent === 'function') {
        return headerContent(headerContext).toString();
      }
      return headerContent?.toString() || '';
    });

    // Get data rows
    const dataRows = table.getRowModel().rows.map(row =>
      visibleColumns.map(column => {
        const cell = row.getAllCells().find(cell => cell.column.id === column.id);
        if (!cell) return '';
        const value = cell.getValue();
        // Convert React elements to string representation
        if (React.isValidElement(value)) {
          return value.props.children?.toString() || '';
        }
        return value instanceof Date ? value.toLocaleDateString() : value;
      })
    );

    // Get footer rows
    const footerRows = table.getFooterGroups().map(footerGroup =>
      footerGroup.headers.filter(header => header.column.getIsVisible()).map(header => {
        const footer = header.column.columnDef.footer;
        if (!footer) return '';
        const rendered = flexRender(footer, header.getContext());
        // Convert React elements to string representation
        if (React.isValidElement(rendered)) {
          return rendered.props.children?.toString() || '';
        }
        return rendered;
      })
    );

    // Combine all rows
    const allRows = [
      headers,
      ...dataRows,
      ...footerRows
    ];

    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Save the file
    XLSX.writeFile(wb, `${exportOptions.fileName || 'export'}.xlsx`);
  };

  return (
    <Container className={cn("space-y-4", className)}>
      {/* Header */}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportExcel}
                    className="flex items-center space-x-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel</span>
                  </Button>
                )}
                {exportOptions.pdf && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="flex items-center space-x-2"
                  >
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
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== 'undefined' && column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center space-x-2">
                          <div
                            {...{
                              className: cn('flex items-center space-x-2',
                                header.column.getCanSort() && 'cursor-pointer select-none'),
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                                setOpenFilterMenus(prev => ({ ...prev, [header.id]: open }));
                                if (open) {
                                  // Initialize temp filter with current value
                                  setTempFilters(prev => ({
                                    ...prev,
                                    [header.column.id]: (header.column.getFilterValue() as string) ?? ''
                                  }));
                                }
                              }}
                            >
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className={cn(
                                    "h-8 w-8 p-0",
                                    header.column.getIsFiltered() && "text-primary dark:text-primary"
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
                                    onChange={(e) => {
                                      setTempFilters(prev => ({
                                        ...prev,
                                        [header.column.id]: e.target.value
                                      }));
                                    }}
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
                  );
                })}
                {rowActions && <TableHead>Actions</TableHead>}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="h-96 text-center"
                >
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
                    <TableCell key={cell.id}>
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
                <TableCell
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="h-24 text-center"
                >
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}
                    </TableCell>
                  ))}
                  {rowActions && <TableCell />}
                </TableRow>
              ))}
            </TableFooter>
          )}
        </Table>
      </div>
    </Container>
  );
}