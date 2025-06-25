import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFinancialTransactionHeaderRepository } from '../../../hooks/useFinancialTransactionHeaderRepository';
import { useIncomeExpenseTransactionRepository } from '../../../hooks/useIncomeExpenseTransactionRepository';
import { Card, CardContent, CardHeader } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { GridColDef } from '@mui/x-data-grid';
import { Loader2, Edit } from 'lucide-react';
import BackButton from '../../../components/BackButton';

function ExpenseProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useQuery } = useFinancialTransactionHeaderRepository();
  const { getByHeaderId } = useIncomeExpenseTransactionRepository();
  const { data: headerData, isLoading: headerLoading } = useQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: !!id,
  });
  const header = headerData?.data?.[0];

  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      if (id) {
        const data = await getByHeaderId(id);
        setEntries(data || []);
        setLoading(false);
      }
    };
    loadEntries();
  }, [id, getByHeaderId]);

  const columns: GridColDef[] = [
    {
      field: 'accounts',
      headerName: 'Account',
      flex: 1,
      minWidth: 150,
      valueGetter: (p) => p.row.accounts?.name,
    },
    {
      field: 'funds',
      headerName: 'Fund',
      flex: 1,
      minWidth: 120,
      valueGetter: (p) => p.row.funds?.name,
    },
    {
      field: 'categories',
      headerName: 'Category',
      flex: 1,
      minWidth: 120,
      valueGetter: (p) => p.row.categories?.name,
    },
    {
      field: 'financial_sources',
      headerName: 'Source',
      flex: 1,
      minWidth: 120,
      valueGetter: (p) => p.row.financial_sources?.name,
    },
    { field: 'amount', headerName: 'Amount', flex: 1, minWidth: 100 },
  ];

  if (headerLoading || loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!header) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <BackButton fallbackPath="/finances/expenses" label="Back" />
        <p className="mt-4">Entry not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <BackButton fallbackPath="/finances/expenses" label="Back to Expenses" />
        {header.status === 'draft' && (
          <Button
            variant="outline"
            onClick={() => navigate(`/finances/expenses/${id}/edit`)}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      <Card className="dark:bg-slate-800 mb-6">
        <CardHeader>
          <h3 className="text-lg font-medium">{header.transaction_number}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{header.description}</p>
        </CardContent>
      </Card>
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <h3 className="text-lg font-medium">Entries</h3>
        </CardHeader>
        <CardContent className="p-0">
          <DataGrid
            columns={columns}
            data={entries}
            totalRows={entries.length}
            loading={loading}
            autoHeight
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ExpenseProfile;
