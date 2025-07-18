import React from 'react';
import { useMemberService } from '../../../hooks/useMemberService';

import MetricCard from '../../../components/dashboard/MetricCard';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '../../../components/ui2/card';
import { TrendingUp } from 'lucide-react';
import { Charts } from '../../../components/ui2/charts';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui2/tabs';
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

  const [trendRange, setTrendRange] = React.useState<'current' | 'thisYear' | 'lastYear'>('current');

  const { data: totals, isLoading: totalsLoading } = useFinancialTotals(memberId);

  const { data: trends, isLoading: trendsLoading } = useFinancialTrends(memberId, trendRange);

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

  const yearColor = (totals?.yearChange || 0) >= 0 ? 'success' : 'destructive';
  const monthColor = (totals?.monthChange || 0) >= 0 ? 'success' : 'destructive';
  const weekColor = (totals?.weekChange || 0) >= 0 ? 'success' : 'destructive';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <MetricCard
          label="Giving this Year"
          value={formatCurrency(totals?.year || 0, currency)}
          icon={TrendingUp}
          iconClassName={`text-${yearColor}`}
          barClassName={`bg-${yearColor}`}
          subtext={`${(totals?.yearChange || 0).toFixed(1)}% from last year`}
          subtextClassName={`text-${yearColor}/70`}
        />
        <MetricCard
          label="Giving this Month"
          value={formatCurrency(totals?.month || 0, currency)}
          icon={TrendingUp}
          iconClassName={`text-${monthColor}`}
          barClassName={`bg-${monthColor}`}
          subtext={`${(totals?.monthChange || 0).toFixed(1)}% from last month`}
          subtextClassName={`text-${monthColor}/70`}
        />
        <MetricCard
          label="Giving this Week"
          value={formatCurrency(totals?.week || 0, currency)}
          icon={TrendingUp}
          iconClassName={`text-${weekColor}`}
          barClassName={`bg-${weekColor}`}
          subtext={`${(totals?.weekChange || 0).toFixed(1)}% from last week`}
          subtextClassName={`text-${weekColor}/70`}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Giving Trend</CardTitle>
            <Tabs value={trendRange} onValueChange={v => setTrendRange(v as any)}>
              <TabsList className="grid grid-cols-3 bg-muted p-1 rounded-full">
                <TabsTrigger value="current" className="flex-1 text-xs font-medium px-3 py-1.5 rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-black dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Current
                </TabsTrigger>
                <TabsTrigger value="thisYear" className="flex-1 text-xs font-medium px-3 py-1.5 rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-black dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  This Year
                </TabsTrigger>
                <TabsTrigger value="lastYear" className="flex-1 text-xs font-medium px-3 py-1.5 rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-black dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Last Year
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
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
                      {new Date(t.date).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
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
