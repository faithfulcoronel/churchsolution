import React from 'react';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { Printer, Download } from 'lucide-react';
import { DataGrid } from '../../../components/ui2/data-grid';
import { Button } from '../../../components/ui2/button';
import { useIncomeExpenseTransactionRepository } from '../../../hooks/useIncomeExpenseTransactionRepository';
import { tenantUtils } from '../../../utils/tenantUtils';
import { generateExpenseSummaryPdf, ExpenseSummaryRecord } from '../../../utils';
import { container } from '../../../lib/container';
import { TYPES } from '../../../lib/types';
import type { IFinanceDashboardRepository } from '../../../repositories/financeDashboard.repository';
import { formatCurrency } from '../../../utils/currency';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { FundBalances } from '../dashboard/FundBalances';

interface Props {
  tenantId: string | null;
  dateRange: { from: Date; to: Date };
}

export default function ExpenseSummaryReport({ tenantId, dateRange }: Props) {
  const { useQuery: useTransactions } = useIncomeExpenseTransactionRepository();
  const { currency } = useCurrencyStore();

  const {
    data: txRes,
    isLoading,
  } = useTransactions({
    filters: {
      transaction_type: { operator: 'eq', value: 'expense' },
      transaction_date: {
        operator: 'between',
        value: format(dateRange.from, 'yyyy-MM-dd'),
        valueTo: format(dateRange.to, 'yyyy-MM-dd'),
      },
    },
    order: { column: 'transaction_date', ascending: true },
    enabled: !!tenantId,
  });

  const financeRepo = container.get<IFinanceDashboardRepository>(TYPES.IFinanceDashboardRepository);
  const { data: fundBalances } = useQuery({
    queryKey: ['fund-balances'],
    queryFn: () => financeRepo.getFundBalances(),
    enabled: !!tenantId,
  });

  const fundMap = React.useMemo(() => {
    const map = new Map<string, number>();
    (fundBalances || []).forEach(f => map.set(f.id, f.balance));
    return map;
  }, [fundBalances]);

  const records = React.useMemo<ExpenseSummaryRecord[]>(
    () =>
      (txRes?.data || []).map(tx => ({
        transaction_date: tx.transaction_date,
        description: tx.description,
        category_name: tx.categories?.name || '',
        fund_name: tx.funds?.name || '',
        fund_balance: fundMap.get(tx.fund_id || '') || 0,
        amount: tx.amount,
      })),
    [txRes, fundMap],
  );

  const columns = React.useMemo<ColumnDef<ExpenseSummaryRecord>[]>(
    () => [
      {
        accessorKey: 'transaction_date',
        header: 'Date',
        cell: ({ row }) =>
          format(new Date(row.original.transaction_date), 'MMM dd, yyyy'),
        size: 120,
        enableSorting: false,
      },
      {
        accessorKey: 'category_name',
        header: 'Expense Category',
        cell: info => (
          <span className="whitespace-normal break-words">
            {String(info.getValue() ?? '')}
          </span>
        ),
        size: 200,
        enableSorting: false,
      },
      { accessorKey: 'description', header: 'Expense Description', enableSorting: false },
      {
        accessorKey: 'fund_name',
        header: 'Fund',
        enableSorting: false,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatCurrency(row.original.amount, currency),
        enableSorting: false,
      },
    ],
    [currency],
  );

  const handlePrint = () => window.print();
  const handlePdf = async () => {
    const tenant = await tenantUtils.getCurrentTenant();
    const blob = await generateExpenseSummaryPdf(
      tenant?.name || '',
      dateRange,
      records,
      fundBalances || [],
    );
    const url = URL.createObjectURL(blob);
    const fileName = `expense-summary-${format(dateRange.from, 'yyyyMMdd')}-${format(dateRange.to, 'yyyyMMdd')}.pdf`;
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
      <DataGrid<ExpenseSummaryRecord>
        data={records}
        columns={columns}
        loading={isLoading}
        exportOptions={{ enabled: true, excel: true, pdf: false, fileName: 'expense-summary' }}
      />
      <FundBalances
        title="Fund Balances Summary"
        funds={(fundBalances || []).filter(f => f.balance !== 0)}
        currency={currency}
      />
    </div>
  );
}
