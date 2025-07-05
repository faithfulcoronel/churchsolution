import React from 'react';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '../../../components/ui2/data-grid';
import { Button } from '../../../components/ui2/button';
import { Printer, Download } from 'lucide-react';
import { useContributionStatements } from '../../../hooks/useContributionStatements';
import { generateMemberGivingSummaryPdf } from '../../../utils';
import { tenantUtils } from '../../../utils/tenantUtils';

interface Props {
  tenantId: string | null;
  dateRange: { from: Date; to: Date };
  memberId?: string | string[];
}

export default function MemberGivingSummaryReport({ tenantId, dateRange, memberId }: Props) {
  const { useStatements } = useContributionStatements();
  const memberParam = Array.isArray(memberId)
    ? memberId.length === 1
      ? memberId[0]
      : undefined
    : memberId;
  const { data: result, isLoading } = useStatements(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
  );
  const rawData = result?.data || [];
  const data = React.useMemo(
    () => (memberParam ? rawData.filter(r => r.member_id === memberParam) : rawData),
    [rawData, memberParam],
  );

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'first_name', header: 'First Name', enableSorting: false },
      { accessorKey: 'last_name', header: 'Last Name', enableSorting: false },
      { accessorKey: 'fund_name', header: 'Fund', enableSorting: false },
      { accessorKey: 'total_amount', header: 'Total Amount', enableSorting: false },
    ],
    [],
  );

  const handlePrint = () => window.print();
  const handlePdf = async () => {
    const tenant = await tenantUtils.getCurrentTenant();
    const blob = await generateMemberGivingSummaryPdf(
      tenant?.name || '',
      dateRange,
      data,
    );
    const url = URL.createObjectURL(blob);
    const fileName = `member-giving-summary-${memberParam || 'all'}-${format(new Date(), 'yyyyMMdd')}.pdf`;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
