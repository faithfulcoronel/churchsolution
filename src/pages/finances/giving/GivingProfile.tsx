import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFinancialTransactionHeaderRepository } from '../../../hooks/useFinancialTransactionHeaderRepository';
import { Card, CardContent, CardHeader } from '../../../components/ui2/card';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { GridColDef } from '@mui/x-data-grid';
import { Loader2 } from 'lucide-react';
import BackButton from '../../../components/BackButton';

function GivingProfile() {
  const { id } = useParams<{ id: string }>();
  const { useQuery, getTransactionEntries } = useFinancialTransactionHeaderRepository();
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
        const data = await getTransactionEntries(id);
        setEntries(data || []);
        setLoading(false);
      }
    };
    loadEntries();
  }, [id, getTransactionEntries]);

  const columns: GridColDef[] = [
    { field: 'member', headerName: 'Member', flex: 1, minWidth: 150, valueGetter: p => p.row.member?.first_name + ' ' + p.row.member?.last_name },
    { field: 'fund', headerName: 'Fund', flex: 1, minWidth: 120, valueGetter: p => p.row.fund?.name },
    { field: 'category', headerName: 'Category', flex: 1, minWidth: 120, valueGetter: p => p.row.category?.name },
    { field: 'source', headerName: 'Source', flex: 1, minWidth: 120, valueGetter: p => p.row.source?.name },
    { field: 'debit', headerName: 'Debit', flex: 1, minWidth: 100 },
    { field: 'credit', headerName: 'Credit', flex: 1, minWidth: 100 },
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
        <BackButton fallbackPath="/finances/giving" label="Back" />
        <p className="mt-4">Batch not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/finances/giving" label="Back to Giving" />
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

export default GivingProfile;
