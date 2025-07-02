import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ColumnSizingState,
  ColumnSizingInfoState,
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
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getData, setData } from '@/utils/LocalStorage';

export interface DataGridProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  recordCount?: number;
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
  onSortingChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState, globalFilter: string) => void;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
  exportOptions?: {
    enabled?: boolean;
    fileName?: string;
    pdf?: boolean;
    excel?: boolean;
  };
  quickFilterPlaceholder?: string;
  /** Optional class name for the internal container */
  containerClassName?: string;
  /** Whether the container should take the full width */
  fluid?: boolean;
  /**
   * Optional key used to store column sizing in localStorage.
   * Provide a unique value per page to scope the cache.
   */
  storageKey?: string;
}

export interface DataGridContextValue<TData, TValue> {
  table: ReturnType<typeof useReactTable<TData>>;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  recordCount: number;
  loading: boolean;
  rowActions?: (row: TData) => React.ReactNode;
  onRowClick?: (row: TData) => void;
  openFilterMenus: Record<string, boolean>;
  setOpenFilterMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  tempFilters: Record<string, string>;
  setTempFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleApplyFilter: (columnId: string) => void;
  handleClearFilter: (columnId: string) => void;
  pageIndex: number;
  pageSize: number;
  pageSizeOptions: number[];
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  columnSizing: ColumnSizingState;
  columnSizingInfo: ColumnSizingInfoState;
  setColumnSizing: React.Dispatch<React.SetStateAction<ColumnSizingState>>;
  setColumnSizingInfo: React.Dispatch<React.SetStateAction<ColumnSizingInfoState>>;
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  exportOptions: NonNullable<DataGridProps<TData, TValue>['exportOptions']>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  quickFilterPlaceholder?: string;
  className?: string;
  /** Optional class name for the internal container */
  containerClassName?: string;
  /** Whether the container should take the full width */
  fluid?: boolean;
  handleExportPDF: () => void;
  handleExportExcel: () => void;
}

const DataGridContext = React.createContext<DataGridContextValue<any, any> | undefined>(undefined);

export function DataGridProvider<TData, TValue>({ children, ...props }: DataGridProps<TData, TValue> & { children: React.ReactNode }) {
  const defaultExportOptions = {
    enabled: true,
    fileName: 'export',
    pdf: true,
    excel: true,
  };

  const {
    columns,
    data,
    recordCount = data.length,
    loading = false,
    title,
    description,
    toolbar,
    rowActions,
    onRowClick,
    onSortingChange,
    onFilterChange,
    onPageChange,
    onPageSizeChange,
    pagination = { pageSize: 10, pageSizeOptions: [5, 10, 20, 50, 100] },
    className,
    containerClassName,
    fluid = false,
    exportOptions: providedExportOptions,
    quickFilterPlaceholder,
    storageKey,
  } = props;

  const exportOptions = { ...defaultExportOptions, ...providedExportOptions };

  type PersistedState = {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    columnVisibility: VisibilityState;
    pageIndex: number;
    pageSize: number;
    globalFilter: string;
  };

  const savedState = React.useMemo(() => {
    if (!storageKey) return undefined;
    return getData(`${storageKey}-state`) as Partial<PersistedState> | undefined;
  }, [storageKey]);

  const [sorting, setSorting] = React.useState<SortingState>(savedState?.sorting ?? []);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(savedState?.columnFilters ?? []);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(savedState?.columnVisibility ?? {});
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(() => {
    if (!storageKey) return {};
    const sizing = getData(`${storageKey}-columnSizing`);
    return (sizing as ColumnSizingState) ?? {};
  });
  const [columnSizingInfo, setColumnSizingInfo] = React.useState<ColumnSizingInfoState>({} as ColumnSizingInfoState);
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState(savedState?.globalFilter ?? '');
  const [openFilterMenus, setOpenFilterMenus] = React.useState<Record<string, boolean>>({});
  const [tempFilters, setTempFilters] = React.useState<Record<string, string>>({});
  const [pageIndex, setPageIndex] = React.useState(savedState?.pageIndex ?? 0);
  const [pageSize, setPageSize] = React.useState(savedState?.pageSize ?? pagination.pageSize ?? 10);
  const pageSizeOptions = pagination.pageSizeOptions ?? [5, 10, 20, 50, 100];

  const defaultColumn = React.useMemo(() => ({
    size: 150,
    minSize: 40,
  }), []);

  React.useEffect(() => {
    if (!storageKey) return;
    const saved = getData(`${storageKey}-columnSizing`);
    if (saved && typeof saved === 'object') {
      setColumnSizing(saved as ColumnSizingState);
    }
  }, [storageKey]);

  React.useEffect(() => {
    if (storageKey) {
      setData(`${storageKey}-columnSizing`, columnSizing);
    }
  }, [storageKey, columnSizing]);

  React.useEffect(() => {
    onSortingChange?.(sorting);
  }, [sorting, onSortingChange]);

  React.useEffect(() => {
    onFilterChange?.(columnFilters, globalFilter);
  }, [columnFilters, globalFilter, onFilterChange]);

  React.useEffect(() => {
    if (!storageKey) return;
    const state: PersistedState = {
      sorting,
      columnFilters,
      columnVisibility,
      pageIndex,
      pageSize,
      globalFilter,
    };
    setData(`${storageKey}-state`, state);
  }, [storageKey, sorting, columnFilters, columnVisibility, pageIndex, pageSize, globalFilter]);

  React.useEffect(() => {
    table.setPageIndex(pageIndex);
  }, [table, pageIndex]);

  React.useEffect(() => {
    table.setPageSize(pageSize);
  }, [table, pageSize]);

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnSizing,
      columnSizingInfo,
    },
    enableRowSelection: true,
    columnResizeMode: 'onChange',
    onColumnSizingChange: setColumnSizing,
    onColumnSizingInfoChange: setColumnSizingInfo,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
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

  const handlePageChange = (newPage: number) => {
    setPageIndex(newPage);
    table.setPageIndex(newPage);
    onPageChange?.(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    table.setPageSize(newSize);
    handlePageChange(0);
    onPageSizeChange?.(newSize);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    if (title) {
      doc.setFontSize(16);
      doc.text(title, 20, 20);
    }

    const visibleColumns = table.getAllColumns().filter(col => col.getIsVisible());

    const headers = visibleColumns.map(column => {
      const headerContext = column.getContext();
      const headerContent = column.columnDef.header;
      if (typeof headerContent === 'function') {
        return headerContent(headerContext).toString();
      }
      return headerContent?.toString() || '';
    });

    const tableData = table.getRowModel().rows.map(row =>
      visibleColumns.map(column => {
        const cell = row.getAllCells().find(cell => cell.column.id === column.id);
        if (!cell) return '';
        const value = cell.getValue();
        if (React.isValidElement(value)) {
          return value.props.children?.toString() || '';
        }
        return value instanceof Date ? value.toLocaleDateString() : String(value);
      })
    );

    const footerData = table.getFooterGroups().map(footerGroup =>
      footerGroup.headers.filter(header => header.column.getIsVisible()).map(header => {
        const footer = header.column.columnDef.footer;
        if (!footer) return '';
        const rendered = flexRender(footer, header.getContext());
        if (React.isValidElement(rendered)) {
          return rendered.props.children?.toString() || '';
        }
        return String(rendered);
      })
    );

    const tableOptions = {
      head: [headers],
      body: tableData,
      foot: footerData,
      startY: title ? 30 : 20,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    } as any;

    autoTable(doc, tableOptions);
    doc.save(`${exportOptions.fileName || 'export'}.pdf`);
  };

  const handleExportExcel = () => {
    const visibleColumns = table.getAllColumns().filter(col => col.getIsVisible());

    const headers = visibleColumns.map(column => {
      const headerContext = column.getContext();
      const headerContent = column.columnDef.header;
      if (typeof headerContent === 'function') {
        return headerContent(headerContext).toString();
      }
      return headerContent?.toString() || '';
    });

    const dataRows = table.getRowModel().rows.map(row =>
      visibleColumns.map(column => {
        const cell = row.getAllCells().find(cell => cell.column.id === column.id);
        if (!cell) return '';
        const value = cell.getValue();
        if (React.isValidElement(value)) {
          return value.props.children?.toString() || '';
        }
        return value instanceof Date ? value.toLocaleDateString() : value;
      })
    );

    const footerRows = table.getFooterGroups().map(footerGroup =>
      footerGroup.headers.filter(header => header.column.getIsVisible()).map(header => {
        const footer = header.column.columnDef.footer;
        if (!footer) return '';
        const rendered = flexRender(footer, header.getContext());
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

    XLSX.writeFile(wb, `${exportOptions.fileName || 'export'}.xlsx`);
  };

  const value: DataGridContextValue<TData, TValue> = {
    table,
    columns,
    data,
    recordCount,
    loading,
    rowActions,
    onRowClick,
    openFilterMenus,
    setOpenFilterMenus,
    tempFilters,
    setTempFilters,
    handleApplyFilter,
    handleClearFilter,
    pageIndex,
    pageSize,
    pageSizeOptions,
    handlePageChange,
    handlePageSizeChange,
    columnSizing,
    columnSizingInfo,
    setColumnSizing,
    setColumnSizingInfo,
    title,
    description,
    toolbar,
    exportOptions,
    globalFilter,
    setGlobalFilter,
    quickFilterPlaceholder,
    className,
    containerClassName,
    fluid,
    handleExportPDF,
    handleExportExcel,
  };

  return <DataGridContext.Provider value={value}>{children}</DataGridContext.Provider>;
}

export function useDataGrid<TData, TValue>() {
  const context = React.useContext(DataGridContext as React.Context<DataGridContextValue<TData, TValue> | undefined>);
  if (!context) {
    throw new Error('useDataGrid must be used within a DataGridProvider');
  }
  return context;
}

export { DataGridContext };

