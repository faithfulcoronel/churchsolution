import React from 'react';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '../../../components/ui2/data-grid';
import { Button } from '../../../components/ui2/button';
import { Printer, Download } from 'lucide-react';
import { useFinancialReports } from '../../../hooks/useFinancialReports';
import { exportReportPdf } from '../../../utils';

interface Props {
  tenantId: string | null;
  dateRange: { from: Date; to: Date };
}

export default function TrialBalanceReport({ tenantId, dateRange }: Props) {
  const { useTrialBalance } = useFinancialReports(tenantId);
  const { data, isLoading } = useTrialBalance(format(dateRange.to, 'yyyy-MM-dd'));

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'account_code', header: 'Account Code' },
      { accessorKey: 'account_name', header: 'Account Name' },
      { accessorKey: 'account_type', header: 'Account Type' },
      { accessorKey: 'debit_balance', header: 'Debit' },
      { accessorKey: 'credit_balance', header: 'Credit' },
    ],
    [],
  );

  const handlePrint = () => window.print();
  const handlePdf = () =>
    exportReportPdf(data, { title: 'Trial Balance', fileName: 'trial-balance' });

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>Print</Button>
        <Button variant="outline" onClick={handlePdf} icon={<Download className="h-4 w-4" />}>PDF</Button>
      </div>
      <DataGrid
        data={data || []}
        columns={columns}
        loading={isLoading}
        exportOptions={{ enabled: true, excel: true, pdf: false, fileName: 'trial-balance' }}
      />
    </div>
  );
}
