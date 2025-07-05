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
  const { data: result, isLoading } = useStatements(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    undefined,
  );
  const rawData = result?.data || [];

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    rawData.forEach(r => set.add(r.category_name || 'Uncategorized'));
    return Array.from(set).sort();
  }, [rawData]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, Map<string, Record<string, number>>>();
    rawData.forEach(rec => {
      const date = rec.entry_date.substring(0, 10);
      const member = `${rec.first_name} ${rec.last_name}`;
      const cat = rec.category_name || 'Uncategorized';
      if (!map.has(date)) map.set(date, new Map());
      const dateMap = map.get(date)!;
      if (!dateMap.has(member)) dateMap.set(member, {});
      const m = dateMap.get(member)!;
      m[cat] = (m[cat] || 0) + Number(rec.amount);
    });
    return map;
  }, [rawData]);

  const tableData = React.useMemo(() => {
    const rows: any[] = [];
    Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([date, members]) => {
        const subTotals: Record<string, number> = {};
        Array.from(members.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .forEach(([member_name, offerings], idx) => {
            const row: any = { entry_date: date, member_name };
            let total = 0;
            categories.forEach(cat => {
              const val = offerings[cat] || 0;
              row[cat] = val;
              total += val;
              subTotals[cat] = (subTotals[cat] || 0) + val;
            });
            row.total = total;
            rows.push(row);
          });
        const subRow: any = { entry_date: date, member_name: 'Sub Total', isSubtotal: true };
        let tot = 0;
        categories.forEach(cat => {
          const val = subTotals[cat] || 0;
          subRow[cat] = val;
          tot += val;
        });
        subRow.total = tot;
        rows.push(subRow);
      });
    return rows;
  }, [grouped, categories]);


  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'entry_date',
        header: 'Date',
        cell: ({ row }) =>
          format(new Date(row.original.entry_date), 'MMM dd, yyyy'),
        size: 120,
        enableSorting: false,
      },
      {
        accessorKey: 'member_name',
        header: 'Member Name',
        cell: ({ row }) =>
          row.original.isSubtotal ? (
            <span className="font-bold">Sub Total</span>
          ) : (
            row.original.member_name
          ),
        enableSorting: false,
      },
      ...categories.map(cat => ({
        accessorKey: cat,
        header: cat,
        cell: ({ row }) => (
          <span className={row.original.isSubtotal ? 'font-bold' : undefined}>
            {formatCurrency(row.original[cat], currency)}
          </span>
        ),
        enableSorting: false,
      })),
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <span className={row.original.isSubtotal ? 'font-bold' : undefined}>
            {formatCurrency(row.original.total, currency)}
          </span>
        ),
        enableSorting: false,
      },
    ],
    [categories, currency],
  );

  const handlePrint = () => window.print();
  const handlePdf = async () => {
    const tenant = await tenantUtils.getCurrentTenant();
    const blob = await generateMemberOfferingSummaryPdf(
      tenant?.name || '',
      dateRange,
      rawData,
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
