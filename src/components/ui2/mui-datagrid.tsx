import React from 'react';
import {
  DataGrid as MuiDataGrid,
  DataGridProps as MuiDataGridProps,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridToolbar,
} from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Extend the MUI DataGrid props to include our custom props
export interface DataGridProps extends Omit<MuiDataGridProps, 'rows'> {
  data?: any[];
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
}

// Style the DataGrid to match our theme
const StyledDataGrid = styled(MuiDataGrid)(({ theme }) => ({
  border: 'none',
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',

  '& .MuiDataGrid-main': {
    backgroundColor: 'var(--background)',
  },

  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: 'var(--muted)',
    borderBottom: '1px solid var(--border)',
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    fontWeight: 500,
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
      backgroundColor: 'var(--accent)',
      '&:hover': {
        backgroundColor: 'var(--accent)',
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
    
    '& .MuiInputBase-root': {
      color: 'var(--foreground)',
      backgroundColor: 'var(--background)',
      borderColor: 'var(--border)',
      
      '&:hover': {
        borderColor: 'var(--ring)',
      },
      
      '&.Mui-focused': {
        borderColor: 'var(--ring)',
        boxShadow: '0 0 0 2px var(--ring)',
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

  // Customize the quick filter input
  '& .MuiDataGrid-toolbarQuickFilter': {
    '& .MuiInputBase-root': {
      backgroundColor: 'var(--background)',
      border: '1px solid var(--border)',
      borderRadius: '0.375rem',
      
      '&:hover': {
        borderColor: 'var(--ring)',
      },
      
      '&.Mui-focused': {
        borderColor: 'var(--ring)',
        boxShadow: '0 0 0 2px var(--ring)',
      },
    },
    '& .MuiInputBase-input': {
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      color: 'var(--foreground)',
      
      '&::placeholder': {
        color: 'var(--muted-foreground)',
        opacity: 1,
      },
    },
  },
}));

export function DataGrid({
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
  columns,
  ...props
}: DataGridProps) {
  const theme = useTheme();

  // Create a custom theme that inherits from the current theme
  const customTheme = createTheme(theme, {
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
          },
        },
      },
    },
  });

  // Handle pagination changes
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    onPageChange?.(model.page);
    onPageSizeChange?.(model.pageSize);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <StyledDataGrid
        rows={data}
        columns={columns}
        rowCount={totalRows}
        loading={loading}
        pageSizeOptions={pageSizeOptions}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
        disableColumnFilter={false}
        disableColumnSelector={false}
        disableDensitySelector={false}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        onPaginationModelChange={handlePaginationModelChange}
        onSortModelChange={onSortChange}
        onFilterModelChange={onFilterChange}
        paginationModel={{ page, pageSize }}
        getRowClassName={() => 'cursor-pointer hover:bg-muted/50'}
        {...props}
      />
    </ThemeProvider>
  );
}