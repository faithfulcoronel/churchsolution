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
  memberId?: string | string[];
}

export default function GivingStatementReport({ tenantId, dateRange, memberId }: Props) {
  const { useGivingStatement } = useFinancialReports(tenantId);
  const memberParam = Array.isArray(memberId)
    ? memberId.length === 1
      ? memberId[0]
      : undefined
    : memberId;
  const { data, isLoading } = useGivingStatement(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    memberParam || '',
    { enabled: !!memberParam },
  );

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'entry_date', header: 'Date' },
      { accessorKey: 'fund_name', header: 'Fund' },
      { accessorKey: 'amount', header: 'Amount' },
      { accessorKey: 'description', header: 'Description' },
    ],
    [],
  );

  const handlePrint = () => window.print();
  const handlePdf = () =>
    exportReportPdf(
      data,
      columns.map(c => ({ key: c.accessorKey as string, header: String(c.header) })),
      { title: 'Giving Statement', fileName: 'giving-statement' },
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
        exportOptions={{ enabled: true, excel: true, pdf: false, fileName: 'giving-statement' }}
      />
    </div>
  );
}
