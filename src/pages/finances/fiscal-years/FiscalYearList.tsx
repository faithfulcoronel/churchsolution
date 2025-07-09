import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFiscalYearRepository } from '../../../hooks/useFiscalYearRepository';
import { FiscalYear } from '../../../models/fiscalYear.model';
import { Card, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { GridColDef } from '@mui/x-data-grid';
import { Plus, Loader2, Eye, Edit } from 'lucide-react';

function FiscalYearList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { useQuery } = useFiscalYearRepository();
  const { data: result, isLoading, error } = useQuery({
    pagination: { page: page + 1, pageSize },
    order: { column: 'start_date', ascending: false },
  });
  const years = result?.data || [];
  const totalCount = result?.count || 0;

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'start_date', headerName: 'Start Date', flex: 1 },
    { field: 'end_date', headerName: 'End Date', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex justify-end gap-2 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${params.row.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${params.row.id}/edit`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Fiscal Years</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage fiscal years.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => navigate('add')} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Fiscal Year
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataGrid<FiscalYear>
                columns={columns}
                data={years}
                totalRows={totalCount}
                loading={isLoading}
                error={error instanceof Error ? error.message : undefined}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                page={page}
                pageSize={pageSize}
                getRowId={row => row.id}
                onRowClick={params => navigate(`${params.id}`)}
                autoHeight
                storageKey="fiscal-year-list"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FiscalYearList;
