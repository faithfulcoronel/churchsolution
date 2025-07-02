import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { useFinancialTransactionHeaderRepository } from '../../../hooks/useFinancialTransactionHeaderRepository';
import { useIncomeExpenseTransactionRepository } from '../../../hooks/useIncomeExpenseTransactionRepository';
import { Card, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Input } from '../../../components/ui2/input';
import { DateRangePickerField } from '../../../components/ui2/date-range-picker-field';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { FinancialTransactionHeader } from '../../../models/financialTransactionHeader.model';
import { GridColDef } from '@mui/x-data-grid';
import { Plus, Search, Calendar } from 'lucide-react';

interface IncomeExpenseListProps {
  transactionType: 'income' | 'expense';
}

function IncomeExpenseList({ transactionType }: IncomeExpenseListProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
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
    filters: {
      id: { operator: 'isAnyOf', value: headerIds },
      transaction_date: {
        operator: 'between',
        value: format(dateRange.from, 'yyyy-MM-dd'),
        valueTo: format(dateRange.to, 'yyyy-MM-dd'),
      },
    },
    order: { column: 'transaction_date', ascending: false },
    enabled: headerIds.length > 0,
  });
  const headers = headerResult?.data || [];
  const isLoading = entriesLoading || headerLoading;

  const filteredHeaders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return headers.filter(h =>
      h.transaction_number.toLowerCase().includes(term) ||
      (h.description || '').toLowerCase().includes(term)
    );
  }, [headers, searchTerm]);

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
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <DateRangePickerField
          value={{ from: dateRange.from, to: dateRange.to }}
          onChange={(range) => {
            if (range.from && range.to) {
              setDateRange({ from: range.from, to: range.to });
            }
          }}
          placeholder="Select date range"
          icon={<Calendar className="h-4 w-4" />}
          showCompactInput
        />
      </div>

      <div className="mt-6">
        <Card className="dark:bg-slate-800">
          <CardContent className="p-0">
            <DataGrid<FinancialTransactionHeader>
              columns={columns}
              data={filteredHeaders}
              totalRows={filteredHeaders.length}
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
              paginationMode="client"
              showQuickFilter={false}
              page={page}
              pageSize={pageSize}
              storageKey="income-expense-list-grid"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default IncomeExpenseList;
