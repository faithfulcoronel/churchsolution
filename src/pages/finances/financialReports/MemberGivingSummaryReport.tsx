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
  memberId?: string;
}

export default function MemberGivingSummaryReport({ tenantId, dateRange, memberId }: Props) {
  const { useMemberGivingSummary } = useFinancialReports(tenantId);
  const { data, isLoading } = useMemberGivingSummary(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    memberId || undefined,
  );

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'first_name', header: 'First Name' },
      { accessorKey: 'last_name', header: 'Last Name' },
      { accessorKey: 'total_amount', header: 'Total Amount' },
    ],
    [],
  );

  const handlePrint = () => window.print();
  const handlePdf = () =>
    exportReportPdf(data, { title: 'Member Giving Summary', fileName: 'member-giving' });

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
        exportOptions={{ enabled: true, excel: true, pdf: false, fileName: 'member-giving' }}
      />
    </div>
  );
}
