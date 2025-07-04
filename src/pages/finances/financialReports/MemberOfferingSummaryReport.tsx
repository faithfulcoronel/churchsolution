import React from 'react';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '../../../components/ui2/data-grid';
import { Button } from '../../../components/ui2/button';
import { Printer, Download } from 'lucide-react';
import { useContributionStatements } from '../../../hooks/useContributionStatements';
import { generateMemberOfferingSummaryPdf } from '../../../utils';
import { tenantUtils } from '../../../utils/tenantUtils';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { formatCurrency } from '../../../utils/currency';

interface Props {
  tenantId: string | null;
  dateRange: { from: Date; to: Date };
}

export default function MemberOfferingSummaryReport({ tenantId, dateRange }: Props) {
  const { useStatements } = useContributionStatements();
  const { currency } = useCurrencyStore();
  const { data: rawData = [], isLoading } = useStatements(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
  );

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    rawData.forEach(r => set.add(r.category_name || 'Uncategorized'));
    return Array.from(set).sort();
  }, [rawData]);

  const records = React.useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    rawData.forEach(rec => {
      const member = `${rec.first_name} ${rec.last_name}`;
      const cat = rec.category_name || 'Uncategorized';
      if (!map.has(member)) map.set(member, {});
      const m = map.get(member)!;
      m[cat] = (m[cat] || 0) + Number(rec.amount);
    });
    return Array.from(map.entries()).map(([member_name, offerings]) => ({
      member_name,
      offerings,
    }));
  }, [rawData]);

  const tableData = React.useMemo(() =>
    records.map(rec => {
      const row: any = { member_name: rec.member_name };
      let total = 0;
      categories.forEach(cat => {
        const val = rec.offerings[cat] || 0;
        row[cat] = val;
        total += val;
      });
      row.total = total;
      return row;
    }),
  [records, categories]);

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'member_name', header: 'Member Name' },
      ...categories.map(cat => ({
        accessorKey: cat,
        header: cat,
        cell: ({ row }) => formatCurrency(row.original[cat], currency),
      })),
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => formatCurrency(row.original.total, currency),
      },
    ],
    [categories, currency],
  );

  const handlePrint = () => window.print();
  const handlePdf = async () => {
    const tenant = await tenantUtils.getCurrentTenant();
    const blob = await generateMemberOfferingSummaryPdf(
      tenant?.name || '',
      dateRange.from,
      records,
    );
    const url = URL.createObjectURL(blob);
    const fileName = `member-offering-summary-${format(dateRange.from, 'yyyyMMdd')}.pdf`;
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
        data={tableData}
        columns={columns}
        loading={isLoading}
        exportOptions={{ enabled: true, excel: true, pdf: false, fileName: 'member-offering-summary' }}
      />
    </div>
  );
}
