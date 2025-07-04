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
  accountId?: string | string[];
}

export default function GeneralLedgerReport({ tenantId, dateRange, accountId }: Props) {
  const { useGeneralLedger } = useFinancialReports(tenantId);
  const accountParam = Array.isArray(accountId)
    ? accountId.length === 1
      ? accountId[0]
      : undefined
    : accountId;
  const { data, isLoading } = useGeneralLedger(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    accountParam || undefined,
  );

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'entry_date', header: 'Date', enableSorting: false },
      { accessorKey: 'account_code', header: 'Account Code', enableSorting: false },
      { accessorKey: 'account_name', header: 'Account Name', enableSorting: false },
      { accessorKey: 'description', header: 'Description', enableSorting: false },
      { accessorKey: 'debit', header: 'Debit', enableSorting: false },
      { accessorKey: 'credit', header: 'Credit', enableSorting: false },
      { accessorKey: 'running_balance', header: 'Balance', enableSorting: false },
    ],
    [],
  );

  const handlePrint = () => window.print();
  const handlePdf = () =>
    exportReportPdf(
      data,
      columns.map(c => ({ key: c.accessorKey as string, header: String(c.header) })),
      { title: 'General Ledger', fileName: 'general-ledger' },
    );

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
        exportOptions={{ enabled: true, excel: true, pdf: false, fileName: 'general-ledger' }}
      />
    </div>
  );
}
