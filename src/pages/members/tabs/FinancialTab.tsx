import React from 'react';
import { useMemberService } from '../../../hooks/useMemberService';

import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui2/card';
import { Charts } from '../../../components/ui2/charts';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { formatCurrency } from '../../../utils/currency';
import { Loader2 } from 'lucide-react';

interface FinancialTabProps {
  memberId: string;
}

export default function FinancialTab({ memberId }: FinancialTabProps) {
  const { currency } = useCurrencyStore();
  const {
    useFinancialTotals,
    useFinancialTrends,
    useRecentTransactions,
  } = useMemberService();

  const { data: totals, isLoading: totalsLoading } = useFinancialTotals(memberId);

  const { data: trends, isLoading: trendsLoading } = useFinancialTrends(memberId);

  const { data: recent } = useRecentTransactions(memberId);

  const chartData = React.useMemo(
    () => ({
      series: [
        {
          name: 'Contributions',
          data: (trends || []).map(t => t.contributions),
        },
      ],
      options: {
        xaxis: { categories: (trends || []).map(t => t.month) },
        yaxis: {
          labels: { formatter: (v: number) => formatCurrency(v, currency) },
        },
        tooltip: { y: { formatter: (v: number) => formatCurrency(v, currency) } },
      },
    }),
    [trends, currency]
  );

  if (totalsLoading && !totals) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Giving this Year</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totals?.year || 0, currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Giving this Month</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totals?.month || 0, currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Giving this Week</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totals?.week || 0, currency)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Giving Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {trendsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Charts type="area" series={chartData.series} options={chartData.options} height={300} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {recent && recent.length > 0 ? (
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.slice(0, 10).map(t => (
                  <tr key={t.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {t.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-4 py-2 text-sm">{t.description}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                      {formatCurrency(Number(t.credit || 0) - Number(t.debit || 0), currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No recent transactions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
