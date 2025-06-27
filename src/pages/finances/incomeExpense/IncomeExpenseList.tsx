import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFinancialTransactionHeaderRepository } from '../../../hooks/useFinancialTransactionHeaderRepository';
import { useIncomeExpenseTransactionRepository } from '../../../hooks/useIncomeExpenseTransactionRepository';
import { Card, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { FinancialTransactionHeader } from '../../../models/financialTransactionHeader.model';
import { GridColDef } from '@mui/x-data-grid';
import { Plus } from 'lucide-react';

interface IncomeExpenseListProps {
  transactionType: 'income' | 'expense';
}

function IncomeExpenseList({ transactionType }: IncomeExpenseListProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { useQuery: useEntryQuery } = useIncomeExpenseTransactionRepository();
  const { useQuery: useHeaderQuery } = useFinancialTransactionHeaderRepository();

  const {
    data: entryResult,
    isLoading: entriesLoading,
    error: entriesError,
  } = useEntryQuery({
    filters: { transaction_type: { operator: 'eq', value: transactionType } },
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
    error: headerError,
  } = useHeaderQuery({
    filters: { id: { operator: 'isAnyOf', value: headerIds } },
    order: { column: 'transaction_date', ascending: false },
    enabled: headerIds.length > 0,
  });
  const headers = headerResult?.data || [];
  const isLoading = entriesLoading || headerLoading;

  const columns: GridColDef[] = [
    { field: 'transaction_date', headerName: 'Date', flex: 1, minWidth: 120 },
    { field: 'transaction_number', headerName: 'Number', flex: 1, minWidth: 150 },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 200 },
  ];

  const title = transactionType === 'income' ? 'Donations' : 'Expenses';
  const description =
    transactionType === 'income'
      ? 'Manage contribution batches.'
      : 'Manage expense entries.';
  const addLabel = transactionType === 'income' ? 'Add Batch' : 'Add Expense';
  const basePath = transactionType === 'income' ? 'giving' : 'expenses';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to={`/finances/${basePath}/add`}>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" /> {addLabel}
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <Card className="dark:bg-slate-800">
          <CardContent className="p-0">
            <DataGrid<FinancialTransactionHeader>
              columns={columns}
              data={headers}
              totalRows={headers.length}
              loading={isLoading}
              error={
                entriesError instanceof Error
                  ? entriesError.message
                  : headerError instanceof Error
                    ? headerError.message
                    : undefined
              }
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              getRowId={(row) => row.id}
              onRowClick={(params) => navigate(`/finances/${basePath}/${params.id}`)}
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

export default IncomeExpenseList;
