import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpeningBalanceRepository } from '../../../hooks/useOpeningBalanceRepository';
import { OpeningBalance } from '../../../models/openingBalance.model';
import { Card, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { GridColDef } from '@mui/x-data-grid';
import { Plus, Loader2 } from 'lucide-react';

function OpeningBalanceList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { useQuery } = useOpeningBalanceRepository();

  const { data: result, isLoading, error } = useQuery({
    pagination: { page: page + 1, pageSize },
    order: { column: 'created_at', ascending: false },
  });
  const balances = result?.data || [];
  const totalCount = result?.count || 0;

  const columns: GridColDef[] = [
    {
      field: 'fiscal_year',
      headerName: 'Fiscal Year',
      flex: 1,
      valueGetter: params => params.row.fiscal_year?.name || '',
    },
    {
      field: 'fund',
      headerName: 'Fund',
      flex: 1,
      valueGetter: params => params.row.fund ? `${params.row.fund.code} - ${params.row.fund.name}` : '',
    },
    { field: 'amount', headerName: 'Amount', flex: 1, type: 'number' },
    { field: 'status', headerName: 'Status', flex: 1 },
  ];

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Opening Balances</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage fund opening balances.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => navigate('add')} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Balance
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
              <DataGrid<OpeningBalance>
                columns={columns}
                data={balances}
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
                storageKey="opening-balance-list"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OpeningBalanceList;
