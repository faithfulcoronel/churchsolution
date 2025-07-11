import React from 'react';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '../../../components/ui2/data-grid';
import { Button } from '../../../components/ui2/button';
import { Printer, Download } from 'lucide-react';
import { useFinancialReports } from '../../../hooks/useFinancialReports';
import { exportReportPdf } from '../../../utils';
import { FundSummary } from '../../../models/financialReport.model';

interface Props {
  tenantId: string | null;
  dateRange: { from: Date; to: Date };
}

export default function FundSummaryReport({ tenantId, dateRange }: Props) {
  const { useFundSummary } = useFinancialReports(tenantId);
  const { data, isLoading } = useFundSummary(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
  );

  const columns = React.useMemo<ColumnDef<FundSummary>[]>(
    () => [
      { accessorKey: 'fund_name', header: 'Fund', enableSorting: false },
      { accessorKey: 'income', header: 'Income', enableSorting: false },
      { accessorKey: 'expenses', header: 'Expenses', enableSorting: false },
      { accessorKey: 'net_change', header: 'Net Change', enableSorting: false },
    ],
    [],
  );

  const handlePrint = () => window.print();
  const handlePdf = () =>
    exportReportPdf(
      data,
      columns.map(c => ({ key: c.accessorKey as string, header: String(c.header) })),
      { title: 'Fund Summary', fileName: 'fund-summary' },
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>Print</Button>
        <Button variant="outline" onClick={handlePdf} icon={<Download className="h-4 w-4" />}>PDF</Button>
      </div>
      <DataGrid<FundSummary>
        data={data || []}
        columns={columns}
        loading={isLoading}
        exportOptions={{ enabled: true, excel: true, pdf: false, fileName: 'fund-summary' }}
      />
    </div>
  );
}
