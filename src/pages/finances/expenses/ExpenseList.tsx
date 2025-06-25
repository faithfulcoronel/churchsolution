import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFinancialTransactionHeaderRepository } from '../../../hooks/useFinancialTransactionHeaderRepository';
import { useIncomeExpenseTransactionRepository } from '../../../hooks/useIncomeExpenseTransactionRepository';
import { Card, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { GridColDef } from '@mui/x-data-grid';
import { Plus } from 'lucide-react';

function ExpenseList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { useQuery: useEntryQuery } = useIncomeExpenseTransactionRepository();
  const { useQuery: useHeaderQuery } = useFinancialTransactionHeaderRepository();

  const { data: entryResult, isLoading: entriesLoading } = useEntryQuery({
    filters: { transaction_type: { operator: 'eq', value: 'expense' } },
  });

  const headerIds = React.useMemo(
    () =>
      Array.from(
        new Set(
          (entryResult?.data || [])
            .map((e: any) => e.header_id)
            .filter((id: string | null) => !!id)
        )
      ),
    [entryResult]
  );

  const {
    data: headerResult,
    isLoading: headerLoading,
    refetch,
  } = useHeaderQuery({
    filters: { id: { operator: 'isAnyOf', value: headerIds } },
    order: { column: 'transaction_date', ascending: false },
  });

  React.useEffect(() => {
    if (headerIds.length > 0) {
      refetch();
    }
  }, [headerIds, refetch]);
  const headers = headerResult?.data || [];
  const isLoading = entriesLoading || headerLoading;

  const columns: GridColDef[] = [
    { field: 'transaction_date', headerName: 'Date', flex: 1, minWidth: 120 },
    { field: 'transaction_number', headerName: 'Number', flex: 1, minWidth: 150 },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 200 },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Expenses</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage expense entries.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="/finances/expenses/add">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <Card className="dark:bg-slate-800">
          <CardContent className="p-0">
            <DataGrid
              columns={columns}
              data={headers}
              totalRows={headers.length}
              loading={isLoading}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              getRowId={(row) => row.id}
              onRowClick={(params) => navigate(`/finances/expenses/${params.id}`)}
              autoHeight
              page={page}
              pageSize={pageSize}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ExpenseList;
