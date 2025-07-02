import React from 'react';
import { cn } from '@/lib/utils';
import { inputVariants } from './input';
import {
  DataGrid as MuiDataGrid,
  DataGridProps as MuiDataGridProps,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridToolbar,
  GridOverlay,
} from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getData, setData } from '@/utils/LocalStorage';

// Extend the MUI DataGrid props to include our custom props
export interface DataGridProps<T> extends Omit<MuiDataGridProps<T>, 'rows'> {
  data?: T[];
  totalRows?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (model: GridSortModel) => void;
  onFilterChange?: (model: GridFilterModel) => void;
  page?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  error?: string;
  paginationMode?: 'client' | 'server';
  showQuickFilter?: boolean;
  /**
   * Optional key to persist pagination and sorting state in localStorage.
   * Stored values include `page`, `pageSize`, `sortModel` and `filterModel`.
   */
  storageKey?: string;
}

// Style the DataGrid to match our theme
const StyledDataGrid = styled(MuiDataGrid)(({ theme }) => ({
  border: 'none',
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--tw-card-box-shadow)',

  '& .MuiDataGrid-main': {
    backgroundColor: 'var(--background)',
  },

  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: 'var(--secondary)',
    borderBottom: '1px solid var(--border)',
    color: 'var(--secondary-foreground)',
    fontSize: '0.875rem',
    fontWeight: 600,
  },

  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid var(--border)',
    color: 'var(--foreground)',
    fontSize: '0.875rem',
  },

  '& .MuiDataGrid-row': {
    '&:hover': {
      backgroundColor: 'var(--muted)',
    },
    '&.Mui-selected': {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
      '&:hover': {
        backgroundColor: 'var(--primary)',
      },
    },
  },

  '& .MuiDataGrid-footerContainer': {
    borderTop: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
  },

  '& .MuiTablePagination-root': {
    color: 'var(--foreground)',
  },

  '& .MuiDataGrid-toolbarContainer': {
    padding: theme.spacing(2),
    backgroundColor: 'var(--background)',
    borderBottom: '1px solid var(--border)',
    
    '& .MuiButton-root': {
      color: 'var(--muted-foreground)',
      '&:hover': {
        backgroundColor: 'var(--accent)',
      },
    },
    
  },

  '& .MuiDataGrid-columnSeparator': {
    display: 'none',
  },

  '& .MuiDataGrid-menuIcon': {
    color: 'var(--muted-foreground)',
  },

  '& .MuiDataGrid-sortIcon': {
    color: 'var(--muted-foreground)',
  },

  '& .MuiDataGrid-filterIcon': {
    color: 'var(--muted-foreground)',
  },

  // Quick filter input inherits shared input styles via className
}));

function ErrorOverlay({ message }: { message?: string }) {
  return (
    <GridOverlay>
      <div className="p-4 text-destructive text-sm text-center w-full">
        {message || 'An error occurred while loading data.'}
      </div>
    </GridOverlay>
  );
}

export function DataGrid<T>({
  data = [],
  totalRows = 0,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onFilterChange,
  page = 0,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  loading = false,
  error,
  paginationMode = 'server',
  showQuickFilter = false,
  storageKey,
  columns,
  ...props
}: DataGridProps<T>) {
  const theme = useTheme();
  const quickFilterClass = React.useMemo(
    () => cn(inputVariants({ size: 'sm' })),
    []
  );

  // Cached pagination, sorting and filtering state stored under
  // `${storageKey}-state`. Supports the legacy `pageIndex` key for
  // backward compatibility.
  const initialCache = React.useMemo(() => {
    if (!storageKey) return undefined;
    return getData(`${storageKey}-state`) as any;
  }, [storageKey]);

  // Create a custom theme that inherits from the current theme.
  // Memoize the theme to avoid unnecessary recalculations.
  const customTheme = React.useMemo(
    () =>
      createTheme(theme, {
        components: {
          MuiDataGrid: {
            styleOverrides: {
              root: {
                border: 'none',
              },
            },
          },
        },
      }),
    [theme]
  );

  React.useEffect(() => {
    if (!initialCache) return;
    const saved = initialCache;
    const savedPage =
      saved.page !== undefined ? saved.page : saved.pageIndex;
    if (onPageChange && savedPage !== undefined && savedPage !== page) {
      onPageChange(savedPage);
    }
    if (onPageSizeChange && saved.pageSize !== undefined && saved.pageSize !== pageSize) {
      onPageSizeChange(saved.pageSize);
    }
    if (onSortChange && saved.sortModel) {
      onSortChange(saved.sortModel);
    }
    if (onFilterChange && saved.filterModel) {
      onFilterChange(saved.filterModel);
    }
  }, []); // run once on mount

  React.useEffect(() => {
    const lastPage = Math.max(0, Math.ceil(totalRows / pageSize) - 1);
    if (page > lastPage) onPageChange?.(lastPage);
  }, [totalRows, pageSize, page]);

  // Handle pagination changes
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    onPageChange?.(model.page);
    onPageSizeChange?.(model.pageSize);
    if (storageKey) {
      const saved = (getData(`${storageKey}-state`) as any) || {};
      setData(`${storageKey}-state`, { ...saved, page: model.page, pageSize: model.pageSize });
    }
  };

  const handleSortModelChange = (model: GridSortModel) => {
    onSortChange?.(model);
    if (storageKey) {
      const saved = (getData(`${storageKey}-state`) as any) || {};
      setData(`${storageKey}-state`, { ...saved, sortModel: model });
    }
  };

  const handleFilterModelChange = (model: GridFilterModel) => {
    onFilterChange?.(model);
    if (storageKey) {
      const saved = (getData(`${storageKey}-state`) as any) || {};
      setData(`${storageKey}-state`, { ...saved, filterModel: model });
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <StyledDataGrid
        rows={data}
        columns={columns}
        rowCount={totalRows}
        loading={loading}
        pageSizeOptions={pageSizeOptions}
        paginationMode={paginationMode}
        sortingMode="server"
        filterMode="server"
        disableColumnFilter={false}
        disableColumnSelector={false}
        disableDensitySelector={false}
        error={!!error}
        slots={{
          toolbar: GridToolbar,
          ...(error ? { errorOverlay: ErrorOverlay } : {}),
        }}
        slotProps={{
          toolbar: {
            showQuickFilter,
            quickFilterProps: {
              debounceMs: 500,
              InputProps: { className: quickFilterClass },
            },
          },
          ...(error ? { errorOverlay: { message: error } } : {}),
        }}
        initialState={initialCache ? {
          pagination: {
            paginationModel: {
              page: (initialCache.page ?? initialCache.pageIndex) ?? page,
              pageSize: initialCache.pageSize ?? pageSize,
            },
          },
          sorting: { sortModel: initialCache.sortModel ?? [] },
          filter: initialCache.filterModel ? { filterModel: initialCache.filterModel } : undefined,
        } : undefined}
        onPaginationModelChange={handlePaginationModelChange}
        onSortModelChange={handleSortModelChange}
        onFilterModelChange={handleFilterModelChange}
        paginationModel={{ page, pageSize }}
        getRowClassName={() => 'cursor-pointer hover:bg-muted/50'}
        {...props}
      />
    </ThemeProvider>
  );
}