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

export default function JournalReport({ tenantId, dateRange }: Props) {
  const { useJournalReport } = useFinancialReports(tenantId);
  const { data, isLoading } = useJournalReport(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
  );

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'entry_date', header: 'Date' },
      { accessorKey: 'account_code', header: 'Account Code' },
      { accessorKey: 'account_name', header: 'Account Name' },
      { accessorKey: 'description', header: 'Description' },
      { accessorKey: 'debit', header: 'Debit' },
      { accessorKey: 'credit', header: 'Credit' },
    ],
    [],
  );

  const handlePrint = () => window.print();
  const handlePdf = () =>
    exportReportPdf(
      data,
      columns.map(c => ({ key: c.accessorKey as string, header: String(c.header) })),
      { title: 'Journal Report', fileName: 'journal' },
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
        exportOptions={{ enabled: true, excel: true, pdf: false, fileName: 'journal' }}
      />
    </div>
  );
}
