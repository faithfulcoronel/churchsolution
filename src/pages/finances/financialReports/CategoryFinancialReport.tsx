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
  categoryId?: string | string[];
}

export default function CategoryFinancialReport({ tenantId, dateRange, categoryId }: Props) {
  const { useCategoryFinancialReport } = useFinancialReports(tenantId);
  const categoryParam = Array.isArray(categoryId)
    ? categoryId.length === 1
      ? categoryId[0]
      : undefined
    : categoryId;
  const { data, isLoading } = useCategoryFinancialReport(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    categoryParam || undefined,
  );

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'category_name', header: 'Category' },
      { accessorKey: 'income', header: 'Income' },
      { accessorKey: 'expenses', header: 'Expenses' },
    ],
    [],
  );

  const handlePrint = () => window.print();
  const handlePdf = () =>
    exportReportPdf(
      data,
      columns.map(c => ({ key: c.accessorKey as string, header: String(c.header) })),
      { title: 'Category Financial', fileName: 'category-financial' },
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
        exportOptions={{ enabled: true, excel: true, pdf: false, fileName: 'category-financial' }}
      />
    </div>
  );
}
